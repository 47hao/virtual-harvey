var stethoscope = pc.createScript('stethscope');
var entity;
/*
stethoscope.attributes.add('radius', {
    type: 'number',
    default: 10,
    title: 'radius',
    description: 'Sphere radius'
});
*/
stethoscope.prototype.initialize = function() {
    
    console.log("Script Loaded");
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.mouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.mouseMove, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.mouseUp, this);
    // entity = new pc.Entity();
    // entity.addComponent('model', {
    //     type: 'sphere',
    // });
    entity = this.entity;
    this.app.counter = 0;
    // this.beat();
    //heartbeat

};

//Fires event at BPM
stethoscope.prototype.update = function(dt){
    this.app.heartCounter += dt;
    if (this.app.heartCounter >= (60/this.app.bpm)){
        this.app.fire("beat", this.app.heartCounter);
        this.app.heartCounter = 0;
    }
    
    this.app.lungCounter += dt;
    if (this.app.lungCounter >= (60/this.app.respRate)){
        this.app.fire("breath", this.app.lungCounter);
        this.app.lungCounter = 0;
    }
    
    if (this.app.listening){
        entity.model.material.opacity = 1;
        entity.model.material.diffuse = new pc.Color(.4, .7, 1);
        entity.model.material.update();
    } /*else {
        entity.model.material.opacity = 0.7;
        entity.model.material.diffuse = new pc.Color(0, 0, 0);
        entity.model.material.update();
    }*/
};

stethoscope.prototype.distance = function(p1,p2) {
    var result = ((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y)+(p1.z-p2.z)*(p1.z-p2.z));
    return result;
};

stethoscope.prototype.mouseMove = function (e) {
    //console.log("Moved");
    //if (entity.model.enabled === false){
    //    entity.model.enabled = true;
    //}
    this.doRaycast(e);
};

stethoscope.prototype.mouseDown = function (e) {

    if (this.app.onBody && e.button === pc.MOUSEBUTTON_LEFT){
        entity.model.material.opacity = 1;
        entity.model.material.diffuse = new pc.Color(.4, .7, 1);
        entity.model.material.update();
    }
    
    
};

stethoscope.prototype.mouseUp = function (e) {
    
    entity.model.material.opacity = 0.7;
    entity.model.material.diffuse = new pc.Color(0, 0, 0);
    entity.model.material.update();
};

stethoscope.prototype.doRaycast = function (screenPosition) { 
    
    var from = this.app.systems.camera.cameras[0].entity.getPosition();
    
    var to = this.app.systems.camera.cameras[0].screenToWorld(screenPosition.x, screenPosition.y, this.app.systems.camera.cameras[0].farClip);

    var results = this.app.systems.rigidbody.raycastAll(from, to);
    var result = null;
    
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
    
    if (result) {
        var point = result.point;
        //console.log("moved to " + point);
        entity.setPosition(point.x, point.y, point.z);
        //console.log("STETH MOVED!!!");
        this.app.fire("stethMoved");
        //this.app.listening = false;
        this.app.onBody = true;
    }else{
        this.app.onBody = false;
    }
    
};