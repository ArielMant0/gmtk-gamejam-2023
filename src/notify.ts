import { Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, TextBlock, Rectangle, Image } from "@babylonjs/gui";
import { IngameTime } from "./core/game-time";
import { Events } from "./core/events";

interface Notification {
    id: number,
    message: string;
    start: number;
    duration: number;
    end: number;
    node: any;
}

interface NotificationOptions {
    duration?: number;
}

interface NotificationOptionsComplete {
    duration: number;
}

enum NotificationType {
    INFO,
    SUCCESS,
    FAILURE
}

const DEFAULT_OPTIONS: NotificationOptionsComplete = {
    duration: 5,
};

const REMOVE_DELAY = 50;

class NotificationManager {

    private _scene: any;
    private _ui: any;

    private _alerts: Array<Notification> = [];

    private _template: any;
    private _parent: any;

    private _COUNT = 1;

    constructor() {
        Events.on("gametime:update", (time: number) => {
            const remove: Array<number> = [];
            this._alerts.forEach((alert: Notification) => {
                if (time >= alert.end) {
                    remove.push(alert.id)
                }
            });
            remove.forEach((d: number, i: number) => setTimeout(() => this._remove(d), REMOVE_DELAY*i));
        })
    }

    public get ready() {
        return this._scene !== undefined && this._ui !== undefined;
    }

    public init(scene: Scene, ui: AdvancedDynamicTexture) {
        this._scene = scene;
        this._ui = ui;

        this._parent = this._ui.getControlByName("NotificationBox");
        this._template = this._ui.getControlByName("Notification0");
    }

    public reset() {
        this._alerts.forEach((alert: Notification) => alert.node.dispose())
        this._alerts = [];
        this._COUNT = 1;
    }

    public info(message: string, options: NotificationOptions = {}) {
        const id = this._COUNT++;
        this._add(
            id,
            message,
            Object.assign(Object.create(DEFAULT_OPTIONS), options),
            this._createNode(id, message, NotificationType.INFO),
        );
    }

    public success(message: string, options: NotificationOptions = {}) {
        const id = this._COUNT++;
        this._add(
            id,
            message,
            Object.assign(Object.create(DEFAULT_OPTIONS), options),
            this._createNode(id, message, NotificationType.SUCCESS),
        );
    }

    public failure(message: string, options: NotificationOptions = {}) {
        const id = this._COUNT++;
        this._add(
            id,
            message,
            Object.assign(Object.create(DEFAULT_OPTIONS), options),
            this._createNode(id, message, NotificationType.FAILURE),
        );
    }

    private _add(id: number, message: string, options: NotificationOptionsComplete, node: any) {
        const start = IngameTime.getTime();
        console.log(start, options.duration, start + options.duration)
        this._alerts.push({
            id: id,
            start: start,
            duration: options.duration,
            end: start + options.duration,
            message: message,
            node: node
        });
    }

    private _remove(id: number) {
        const index = this._alerts.findIndex(d => d.id === id)
        if (index >= 0) {
            const alert = this._alerts.splice(index, 1)[0];
            //  remove UI object
            alert.node.dispose();
        }
    }

    private _createNode(id: number, message: string, type: NotificationType) {
        if (!this._parent || !this._template) return;

        const node = this._template.clone() as Rectangle;
        node.name = "Notification" + id;

        const descendants = node.getDescendants(false, (control: Control) => {
            return control.getClassName() === "TextBlock" || control.getClassName() === "Image";
        });

        const icon = descendants.find((d: Control) => d.name === "NotificationIcon") as Image

        switch(type) {
            case NotificationType.SUCCESS:
                node.background = "#26B40A99";
                icon.source = "assets/icons/thumb-up.png";
                break;
            case NotificationType.FAILURE:
                node.background = "#E4341F99";
                icon.source = "assets/icons/thumb-down.png";
                break;
            default:
                node.background = "#14647599";
                icon.source = "assets/icons/info.png";
        }

        // set message
        const text = descendants.find((d: Control) => d.name === "NotificationText") as TextBlock
        text.text = message;
        text.color = "white";


        node.isVisible = true;

        this._parent.addControl(node);

        return node;
    }
}

export const Notifier = new NotificationManager();