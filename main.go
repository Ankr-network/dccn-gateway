package main

import (
	"flag"
	"log"
	"net/http"
	"path"
	"strings"
	"google.golang.org/grpc"
	"encoding/json"
	//"google.golang.org/grpc/status"
	gwdcmgr "github.com/Ankr-network/dccn-common/protos/gateway/dcmgr/v1"
	gwtaskmgr "github.com/Ankr-network/dccn-common/protos/gateway/taskmgr/v1"
	gwusermgr "github.com/Ankr-network/dccn-common/protos/gateway/usermgr/v1"
	gwlogmgr "github.com/Ankr-network/dccn-common/protos/gateway/logmgr/v1"
	"github.com/golang/glog"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"golang.org/x/net/context"
)

const (
	grpcPort = "50051"
)

var (
	getEndpoint  = flag.String("get", "dccn-facade:"+grpcPort, "endpoint of YourService")
	postEndpoint = flag.String("post", "dccn-facade:"+grpcPort, "endpoint of YourService")

	swaggerDir = flag.String("swagger_dir", "template", "path to the directory which contains swagger definitions")
)

type errorBody struct {
	Err string `json:"Error,omitempty"`
	Code string `json:"Code,omitempty"`
	Method string `json:"Method,omitempty"`
}

func CustomHTTPError(ctx context.Context, _ *runtime.ServeMux, marshaler runtime.Marshaler, w http.ResponseWriter, _ *http.Request, err error) {
    const fallback = `{"error": "failed to marshal error message"}`

    w.Header().Set("Content-type", marshaler.ContentType())
	w.WriteHeader(runtime.HTTPStatusFromCode(grpc.Code(err)))
	log.Printf(err.Error())
	log.Printf(grpc.ErrorDesc(err))
	var code string
	var errors string
	if grpc.ErrorDesc(err) == "Not Implemented" {
		code = "NotFoundError"
		errors = "This Api is not Implemented"
	} else {
	if len(strings.Split(grpc.ErrorDesc(err), ":")) >= 3 {
		code = strings.Split(grpc.ErrorDesc(err), ":")[1]
		errors =  strings.Join(strings.Split(grpc.ErrorDesc(err), ":")[2:], ":")
		} else {
		code = "Invalid Format"
		errors = "Invalid Format Error" 
		}
	}
    jErr := json.NewEncoder(w).Encode(errorBody{
		Err: errors,
		Code: code,
		Method: strings.Split(grpc.ErrorDesc(err), ":")[0],
    })

    if jErr != nil {
        w.Write([]byte(fallback))
    }
}

func newGateway(ctx context.Context, opts ...runtime.ServeMuxOption) (http.Handler, error) {
	//mux := runtime.NewServeMux(
	//	runtime.WithProtoErrorHandler(CustomHTTPError))
	mux := runtime.NewServeMux(runtime.WithProtoErrorHandler(CustomHTTPError), runtime.WithMarshalerOption(runtime.MIMEWildcard, &runtime.JSONPb{OrigName: true, EmitDefaults: true}))
	dialOpts := []grpc.DialOption{grpc.WithInsecure()}
	err := gwdcmgr.RegisterDCAPIHandlerFromEndpoint(ctx, mux, *getEndpoint, dialOpts)
	if err != nil {
		return nil, err
	}

	err = gwdcmgr.RegisterDCAPIHandlerFromEndpoint(ctx, mux, *postEndpoint, dialOpts)
	if err != nil {
		return nil, err
	}

	err = gwusermgr.RegisterUserMgrHandlerFromEndpoint(ctx, mux, *getEndpoint, dialOpts)
	if err != nil {
		return nil, err
	}

	err = gwusermgr.RegisterUserMgrHandlerFromEndpoint(ctx, mux, *postEndpoint, dialOpts)
	if err != nil {
		return nil, err
	}

	err = gwtaskmgr.RegisterAppMgrHandlerFromEndpoint(ctx, mux, *getEndpoint, dialOpts)
	if err != nil {
		return nil, err
	}

	err = gwtaskmgr.RegisterAppMgrHandlerFromEndpoint(ctx, mux, *postEndpoint, dialOpts)
	if err != nil {
		return nil, err
	}
	err = gwlogmgr.RegisterLogMgrHandlerFromEndpoint(ctx, mux, *postEndpoint, dialOpts)
	if err != nil {
		return nil, err
	}

	return mux, nil
}

func serveSwagger(w http.ResponseWriter, r *http.Request) {
	if !strings.HasSuffix(r.URL.Path, ".swagger.json") {
		glog.Errorf("Swagger JSON not Found: %s", r.URL.Path)
		http.NotFound(w, r)
		return
	}

	glog.Infof("Serving %s", r.URL.Path)
	p := strings.TrimPrefix(r.URL.Path, "/swagger/")
	p = path.Join(*swaggerDir, p)
	http.ServeFile(w, r, p)
}

func preflightHandler(w http.ResponseWriter, r *http.Request) {
	headers := []string{"Content-Type", "Accept", "authorization"}
	w.Header().Set("Access-Control-Allow-Headers", strings.Join(headers, ","))
	methods := []string{"GET", "HEAD", "POST", "PUT", "DELETE"}
	w.Header().Set("Access-Control-Allow-Methods", strings.Join(methods, ","))
	glog.Infof("preflight request for %s", r.URL.Path)
	return
}

// allowCORS allows Cross Origin Resoruce Sharing from any origin.
// Don't do this without consideration in production systems.
func allowCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			if r.Method == "OPTIONS" && r.Header.Get("Access-Control-Request-Method") != "" {
				preflightHandler(w, r)
				return
			}
		}
		h.ServeHTTP(w, r)
	})
}

func Run(address string, opts ...runtime.ServeMuxOption) error {
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	//mux := runtime.NewServeMux()
	mux := http.NewServeMux()

	mux.HandleFunc("/swagger/", serveSwagger)

	gw, err := newGateway(ctx, opts...)
	if err != nil {
		return err
	}
	mux.Handle("/", gw)

	return http.ListenAndServe(address, allowCORS(mux))

}

func main() {
	flag.Parse()
	defer glog.Flush()

	if err := Run(":8080"); err != nil {
		glog.Fatal(err)
	}
}
