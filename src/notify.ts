import { Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, TextBlock, Rectangle } from "@babylonjs/gui";
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
    icon?: string;
    duration?: number;
}

interface NotificationOptionsComplete {
    icon: string;
    duration: number;
}

enum NotificationType {
    INFO,
    SUCCESS,
    FAILURE
}

const DEFAULT_OPTIONS: NotificationOptionsComplete = {
    icon: "",
    duration: 3,
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
                if (alert.end >= time) {
                    remove.push(alert.id)
                }
            });
            remove.forEach((d: number, i: number) => setTimeout(() => this._remove(d), REMOVE_DELAY*i));
        })
    }

    public init(scene: Scene, ui: AdvancedDynamicTexture) {
        this._scene = scene;
        this._ui = ui;

        this._parent = this._ui.getControlByName("Notification0");
        this._template = this._ui.getControlByName("NotificationBox");
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

        switch(type) {
            case NotificationType.SUCCESS:
                node.background = "#00ff00ff";
                break;
            case NotificationType.FAILURE:
                node.background = "#ff0000ff";
                break;
            default:
                node.background = "#0000ffff";
        }

        const descendants = node.getDescendants(false, (control: Control) => {
            return control.getClassName() === "TextBlock" || control.getClassName() === "Image";
        });

        // set message
        const text = descendants.find((d: Control) => d.name === "NotificationMessage") as TextBlock
        text.text = message;

        this._parent.addControl(node);
    }
}

export const Notifier = new NotificationManager();