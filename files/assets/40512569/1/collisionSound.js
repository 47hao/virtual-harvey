var CollisionSound = pc.createScript('collisionSound');

// initialize code called once per entity
CollisionSound.prototype.initialize = function() {
    this.entity.collision.on("triggerenter", this.onTriggerEnter, this);
    this.entity.collision.on("triggerleave", this.onTriggerLeave, this);
    
    this.app.on("soundSet", this.setSound, this);
    this.app.on("stopSound", this.stopSound, this);
    
    if (this.entity.tags.has("Heart")) {
        this.app.on("beat", this.onPulse, this);
    } else if (this.entity.tags.has("Lung"))  {
        this.app.on("breath", this.onPulse, this);
    }
    this.entity.slots = Object.keys(this.entity.sound.slots);
    this.entity.inZone = false;
    this.loadSounds();
};

CollisionSound.prototype.update = function(e) {
    if ((this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT) || this.app.listening) && this.entity.inZone){
        //console.log(">listening to " + this.entity.name);
        this.raiseVolume();
    } else {
        this.lowerVolume();
    }
};

CollisionSound.prototype.stopSound = function(e) {

    if (this.entity.track) {// !== null){
        console.log("STOPPING REAL SOUND");
        this.entity.track.stop();
    }
};


CollisionSound.prototype.loadSounds = function(e){
    var soundDic = {
        /*
        a13: this.app.assets.get(40675923),
        m13: this.app.assets.get(40675924),
        t13: this.app.assets.get(40675926),
        p13: this.app.assets.get(40675925),

        a22: this.app.assets.get(40675992),
        m22: this.app.assets.get(40675993),
        t22: this.app.assets.get(40676032),
        p22: this.app.assets.get(40676031),

        a44: this.app.assets.get(40676051),
        m44: this.app.assets.get(40676036),
        t44: this.app.assets.get(40676038),
        p44: this.app.assets.get(40676037),

        a64: this.app.assets.get(40676060),
        m64: this.app.assets.get(40676062),
        t64: this.app.assets.get(40676061),
        p64: this.app.assets.get(40676063),
        */
        a13: this.app.assets.get(40799067),
        m13: this.app.assets.get(40799070),
        t13: this.app.assets.get(40799076),
        p13: this.app.assets.get(40799074),

        a22: this.app.assets.get(40799071),
        m22: this.app.assets.get(40799072),
        t22: this.app.assets.get(40799081),
        p22: this.app.assets.get(40799075),
        
        a42: this.app.assets.get(40799068),
        m42: this.app.assets.get(40799073),
        t42: this.app.assets.get(40799080),
        p42: this.app.assets.get(40799079),
        
        a44: this.app.assets.get(40799107),
        m44: this.app.assets.get(40799108),
        t44: this.app.assets.get(40799106),
        p44: this.app.assets.get(40799109),
        
        a64: this.app.assets.get(40799069),
        m64: this.app.assets.get(40799077),
        t64: this.app.assets.get(40799066),
        p64: this.app.assets.get(40799078),
        
        ex_wheeze_15: this.app.assets.get(40799136),
        insp_crackles: this.app.assets.get(40799137),
        vesicular: this.app.assets.get(40799139),
        wheeze: this.app.assets.get(40799141),
        rub: this.app.assets.get(40799140),
        insp_exp_crackles:this.app.assets.get(40799138)
    };

    for (var key in soundDic){
        this.entity.sound.addSlot(key, {asset: soundDic[key]});
    }
};
//Set sound function, for now just plays normal sound

CollisionSound.prototype.onPulse = function (e) {
    //console.log("trying pulse");
    if(!this.entity.track) {
        return;
    }
    console.log("Playing");
    this.entity.track.play();
    // this.lowerVolume();
};

CollisionSound.prototype.lowerVolume = function () {
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

CollisionSound.prototype.onTriggerEnter = function(entity) {
    this.entity.inZone = true;
};

CollisionSound.prototype.onTriggerLeave = function(entity) {
    this.entity.inZone = false;
};

CollisionSound.prototype.setSound = function (e) {
    if (this.entity.tags.has("Heart")){
        if (this.app.heartSelect == 'None'){
            this.entity.track = null;
        } else{
            var trackName = this.entity.tags.list()[1].toLowerCase() + this.app.heartSelect.substring(0,2);
            console.log("loading track" + trackName);
            this.entity.track = this.entity.sound.slot(trackName);
            if(this.entity.track) {
                console.log("success!");
            }
        }
    } else if (this.entity.tags.has("Lung")) {
        console.log("Setting lung: " + this.app.lungSelect);
        if (this.app.lungSelect == 'None'){
            this.entity.track = null;
        } else if (this.app.lungSelect == "Exp Wheeze"){
            this.entity.track = this.entity.sound.slot("ex_wheeze_15");
        } else if (this.app.lungSelect == "Insp Crackles"){
            this.entity.track = this.entity.sound.slot("insp_crackles");
        } else if (this.app.lungSelect == "Vesicular"){
            this.entity.track = this.entity.sound.slot("vesicular");
        } else if (this.app.lungSelect == "Wheeze"){
            this.entity.track = this.entity.sound.slot("wheeze");
        } else if (this.app.lungSelect == "Insp Exp Crackles"){
            this.entity.track = this.entity.sound.slot("insp_exp_crackles");
        } else if (this.app.lungSelect == "Rub"){
            this.entity.track = this.entity.sound.slot("rub");
        } 
    } 
    // if (this.entity.track) {
    //     console.log(this.entity.name + " INIT LOWERING VOL");
    //     this.lowerVolume();
    //     this.entity.track.loop = false;
    // }
};
