import { EventEmitter } from "events";
import { Request, Response, Application } from "express";

type AdapterOptions = "express" | "nest" | "nextjs";
type Options = {
  adapter: AdapterOptions;
  context: Application;
};

interface Adapter {
  add(route: string, callback: (req: Request, res: Response) => void): void;
  addAppContext(app: Application): void;
}

class ExpressAdapter extends EventEmitter implements Adapter {
  public app: Application;

  public add(route: string, callback: (req: Request, res: Response) => void) {
    if (!this.app) {
      throw new Error(
        "ExpressAdapter's app is not set. Make sure to call addAppContext before using add."
      );
    }

    console.log("route", route);

    const SSE_ROUTE = route + "/listen";
    this.app.get(SSE_ROUTE, (req, res) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      this.addListener("our_event", (e) => {
        console.log("wrote something", e);
      });
    });
    this.app.get(route, (req, res) => {
      const REQUEST: any = { body: req.body };
      const RESPONSE: any = {
        write: (data: any) => this.emit("our_event", data),
      };
      // Invoke the user-defined callback
      callback(REQUEST, RESPONSE);
    });
  }

  public addAppContext(app) {
    this.app = app;
  }

  constructor() {
    super();
  }
}

export class EasyEvents {
  private adapter: Adapter;

  public add: (
    route: string,
    callback: (req: Request, res: Response) => void
  ) => void;

  constructor(options: Options) {
    if (options.adapter === "express") {
      this.adapter = new ExpressAdapter();
      this.add = this.adapter.add.bind(this.adapter);
      console.log("Initializing EasyEvents for Express");
      this.createAppContext(options.context);
    }
  }

  private isExpressAdapter(instance: any): instance is ExpressAdapter {
    return instance instanceof ExpressAdapter;
  }

  private createAppContext(context) {
    if (this.isExpressAdapter(this.adapter)) {
      this.adapter.addAppContext(context);
    }
  }
}
