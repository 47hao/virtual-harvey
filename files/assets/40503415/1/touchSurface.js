var touchSurface = pc.createScript('touchSurface');

var sound;
var slots;

// initialization code, called once at start of program
touchSurface.prototype.initialize = function() {
    
    // Add a mousedown event handler:
    
    //ScriptType -> Application -> MouseComponent -> on (to add an even listener)
    //pc.EVENT_MOUSEDOWN fire whenever mouse clicks
    //this.mouseDown is a function that runs when EVENT_MOUSEDOWN is fired
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.mouseDown, this);
    
    //sound = ScriptType -> Entity -> SoundComponent
    sound = this.entity.sound;
    
    //different sound files are stored in a 'slots' dictionary in the SoundComponent
    //setting slots to the NAMES of each sound file by grabbing the keys
    slots = Object.keys(sound.slots);
};

// function to be called whenever mouse is clicked, e is passed from the event that is fired,
// in this case e is the x and y coordinate of the mouse
touchSurface.prototype.mouseDown = function (e) {
    this.doRaycast(e);
};

touchSurface.prototype.distance = function(p1,p2) {
    var result = ((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y)+(p1.z-p2.z)*(p1.z-p2.z));
    return result;
};

// Raycast shoots a laser from one point to another and returns the position of the first object hit.
// This function shoots from the camera to the mouse, and returns the first object in between.
touchSurface.prototype.doRaycast = function (screenPosition) { 
    // Vector to raycast from (camera position)
    // ScriptType -> Application -> Systems -> CameraComponentSystem -> CameraComponent -> entity -> Position
    var from = this.app.systems.camera.cameras[0].entity.getPosition();
    
    // Vector to raycast to (mouse position)
    // screenPosition is MousePosition because e is passed from mouseDown
    // ScriptType -> Application -> Systems -> CameraComponentSystem -> CameraCompomnent -> screenToWord (Grab 3d point from camera)
    // screenToWorld uses the mouse for x and y, and the furthest point the camrea renders for z
    //console.log("mouse pos: " + screenPosition.x + ", " + screenPosition.y);
    var to = this.app.systems.camera.cameras[0].screenToWorld(screenPosition.x, screenPosition.y, this.app.systems.camera.cameras[0].farClip);
    //console.log("from: " + from + ", to: " + to);
    // Raycast between the two points, return first entity hit
    var results = this.app.systems.rigidbody.raycastAll(from, to);
    var result = null;
    
    //console.log("raycast found " + results.length);
    //CALCULATE ALL CAMERA DISTANCES
    var minSquaredDist = -1;
    
    for (i=0; i <results.length; i++) {
        if (results[i].entity.name == "BodyModel")// || results[i].entity.name == "Trooper") 
        {
            
            dist = this.distance(from, results[i].point);
           // console.log("found point at distance " + dist);
            if (minSquaredDist == -1 || dist < minSquaredDist) {
                minSquaredDist = dist;
                result = results[i];
            }
        }
    }
    
    // If there was a hit, result will store: entity hit, normal vector, point
    if (result !== null) {
        sound.play(slots[0]);
        var point = result.point;
        this.app.fire("moveMarker", result.point);
    }else{
        //console.log("Nothing Found");
    }    
};
    