var AudioSpeed = pc.createScript('audioSpeed');

// initialize code called once per entity
AudioSpeed.prototype.initialize = function() {
    this.entity.slots = Object.keys(this.entity.sound.slots);
    this.entity.sound.play(this.entity.slots[0]);
    this.pitch = 0;
};

AudioSpeed.prototype.update = function(e) {
    if (this.app.keyboard.wasPressed(pc.KEY_0)){
        this.entity.sound.pitch += 0.1;
    } else if (this.app.keyboard.wasPressed(pc.KEY_1)) {
        this.entity.sound.pitch -= 0.1;
    }
};
/*
AudioSpeed.prototype.stopSound = function(e) {

    if (this.entity.track) {// !== null){
        console.log("STOPPING REAL SOUND");
        this.entity.track.stop();
    }
};


CollisionSound.prototype.raisePitch = function () {
    if(this.entity.track === null || !this.entity.track) {
        return;
    }
    for (var i = 0; i < this.entity.track.instances.length; i++){
        this.entity.track.instances[i].volume = 0; 
    } 
};

CollisionSound.prototype.raiseVolume = function () {
    if(this.entity.track === null || !this.entity.track) {
        return;
        //console.log("raising null track");
    }
    
    //console.log("raiseVolume called for " + this.entity.name);
    for (var i = 0; i < this.entity.track.instances.length; i++){
        if(this.entity.tags.has("Heart")) {
            this.entity.track.instances[i].volume = 1; //heart volume
        } else {
            this.entity.track.instances[i].volume = 0.3;  //lung volume
        }
    }
};
*/