import { TransformNode, ShadowGenerator, Scene, Vector3, UniversalCamera, ActionManager, PlaySoundAction, Sound, Color3, Color4, CreateBox, CreatePlane, Matrix, Quaternion, StandardMaterial, Texture } from "@babylonjs/core";
import InputControls from "./input-controls";

export class Player extends TransformNode {
    public camera;
    public scene: Scene;

    private _input;
    private _cameraRoot;

    public mesh; //outer collisionbox of player

    //player movement vars
    private _deltaTime: number = 0;
    private _h: number = 0;
    private _v: number = 0;

    private _moveDirection: Vector3 = new Vector3();
    private _inputAmt: number = 0;

    private static readonly PLAYER_SPEED: number = 0.45;

    constructor(scene: Scene, input: InputControls) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();
        this._input = input;
        this.registerEvents();
    }

    public registerEvents() {
        this.scene.registerBeforeRender(() => {
            this._updatePlayer();
            this._updateCamera();
        });
    }

    public reset() {
        this.mesh.position = new Vector3(0, -4, 0);
        this._cameraRoot.position = new Vector3(0, 0, 0);
    }

    public async load() {
        //collision mesh
        const outer = CreateBox("outer", { width: 2, depth: 1, height: 3 }, this.scene);
        outer.isVisible = false;
        outer.isPickable = false;
        outer.checkCollisions = true;

        // move origin of box collider to the bottom of the mesh (to match imported player mesh)
        outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0));

        // for collisions
        outer.ellipsoid = new Vector3(1, 1.5, 1);
        outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

        outer.rotationQuaternion = new Quaternion(0, 1, 0, 0); // rotate the player mesh 180 since we want to see the back of the player

        const faceCols = new Color4(0, 0, 0, 1)
        const box = CreateBox("Small1", { width: 0.5, depth: 0.5, height: 0.25, faceColors: [faceCols, faceCols, faceCols, faceCols, faceCols, faceCols] }, this.scene);
        box.position.y = 1.5;
        box.position.z = 1;
        box.isPickable = false;

        const body = CreatePlane("body", { height: 3, width: 2 }, this.scene);
        const bodymtl = new StandardMaterial("red", this.scene);
        bodymtl.diffuseTexture = new Texture("icons/troll.png");
        body.material = bodymtl;
        body.isPickable = true;
        body.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0)); // simulates the imported mesh's origin

        // parent the meshes
        box.parent = body;
        body.parent = outer;

        this.mesh = outer;
        this.mesh.parent = this;

        // add action listener that plays a sound on click
        const mesh = this.mesh.getChildMeshes(true)[0];
        mesh.actionManager = new ActionManager(this.scene);
        mesh.actionManager.registerAction(new PlaySoundAction(
            ActionManager.OnPickTrigger,
            this.scene.getSoundByName("bump") as Sound
        ))

        this.reset();
    }

    public async addShadows(shadowGenerator: ShadowGenerator) {
        shadowGenerator.addShadowCaster(this.mesh);
    }

    private _setupPlayerCamera() {
        this._cameraRoot = new TransformNode("root");
        this._cameraRoot.position = new Vector3(0, 0, 0);
        this._cameraRoot.rotation = new Vector3(0, Math.PI, 0);

        this.camera = new UniversalCamera("cam", new Vector3(0, 0, -40), this.scene);
        this.camera.fov = 0.47350045992678597;
        this.camera.lockedTarget = this._cameraRoot.position;
        this.camera.parent = this._cameraRoot;

        this.scene.activeCamera = this.camera;
        return this.camera;
    }

    private _updatePlayer() {
        this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

        this._moveDirection = Vector3.Zero();
        this._h = this._input.horizontal; //right, x
        this._v = this._input.vertical; //up, y

        //--MOVEMENTS BASED ON CAMERA (as it rotates)--
        const right = this._cameraRoot.right;
        const up = this._cameraRoot.up;
        const correctedVertical = right.scaleInPlace(this._h);
        const correctedHorizontal = up.scaleInPlace(this._v);

        //movement based off of camera's view
        const move = correctedHorizontal.addInPlace(correctedVertical);

        //clear y so that the character doesnt fly up, normalize for next step
        this._moveDirection = new Vector3((move).normalize().x, (move).normalize().y, 0);

        //clamp the input value so that diagonal movement isn't twice as fast
        let inputMag = Math.abs(this._h) + Math.abs(this._v);
        this._inputAmt = Math.min(Math.max(0, inputMag), 1);

        // final movement that takes into consideration the inputs
        this._moveDirection = this._moveDirection.scaleInPlace(this._inputAmt * Player.PLAYER_SPEED);
        this.mesh.moveWithCollisions(this._moveDirection)
    }

    private _updateCamera() {
        //update camera postion up/down movement
        this._cameraRoot.position = Vector3.Lerp(
            this._cameraRoot.position,
            this.mesh.position,
            0.4
        );
    }

}
