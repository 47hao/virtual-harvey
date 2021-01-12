var Ui = pc.createScript('ui');

var UI;

Ui.attributes.add('css', {type: 'asset', assetType:'css', title: 'CSS Asset'});
Ui.attributes.add('html', {type: 'asset', assetType:'html', title: 'HTML Asset'});
Ui.attributes.add('mobileHtml', {type: 'asset', assetType:'html', title: 'mobile HTML Asset'});

Ui.prototype.initialize = function () {
    this.app.set = false;
    // create STYLE element
    var style = document.createElement('style');

    // append to head
    document.head.appendChild(style);
    style.innerHTML = this.css.resource || '';
    
    // Add the HTML
    this.div = document.createElement('div');
    if(pc.platform.mobile) {
        this.div.classList.add('mobileContainer');
        this.div.innerHTML = this.mobileHtml.resource || '';
        
    } else {
        this.div.classList.add('container');
        this.div.innerHTML = this.html.resource || '';
    }
    
    //this.div.innerHTML = this.html.resource || '';
    
    //this.div2 = document.createElement('div');
    //this.div2.classList.add('stethButton');
    //this.div2.innerHTML = this.html.resource || '';
    
    // append to body
    // can be appended somewhere else
    // it is recommended to have some container element
    // to prevent iOS problems of overfloating elements off the screen
    document.body.appendChild(this.div);
    this.bindEvents();
};


Ui.prototype.bindEvents = function() {
    var self = this;
    
    UI = {
        bpmSlider   :this.div.querySelector('.bpmSlider'),
        respSlider  :this.div.querySelector('.respSlider'),
        bpm         :this.div.querySelector('.bpm'),
        respRate    :this.div.querySelector('.respRate'),
        button      :this.div.querySelector('.button'),
        stethButton :this.div.querySelector('.stethButton'),
        heartSelect :this.div.querySelector('.heartSelect'),
        lungSelect  :this.div.querySelector('.lungSelect'),
    };
    
    UI.heartSelect.onchange = self.updateSounds();
    UI.lungSelect.onchange = self.updateSounds();
    
    var dragEvent = 'mousemove';
    if(pc.platform.mobile) {
        dragEvent = 'touchmove'; 
    }
    
    if (UI.bpmSlider){
        UI.bpmSlider.addEventListener('change', function() {
            if (UI.bpm){
                console.log("VALUE CHANGE");
                UI.bpm.textContent = UI.bpmSlider.value;
                self.updateSounds();
            }
        });  
    }
    if (UI.respSlider){
        UI.respSlider.addEventListener('change', function() {
            if (UI.respRate){
                UI.respRate.textContent = UI.respSlider.value;
                self.updateSounds();
            }
        });
    }
    if (UI.respSlider){
        UI.respSlider.addEventListener(dragEvent, function() {
            if (UI.respRate){
                UI.respRate.textContent = UI.respSlider.value;
            }
        });
    }
    if (UI.bpmSlider){
        UI.bpmSlider.addEventListener(dragEvent, function() {
            if (UI.bpm){
                UI.bpm.textContent = UI.bpmSlider.value;
            }
        });  
    }
    
    
    if (UI.heartSelect){
        UI.heartSelect.addEventListener('change', function(){
            self.updateSounds();
        });
    }
    
    if (UI.lungSelect){
        UI.lungSelect.addEventListener('change', function(){
            self.updateSounds();
        });
    }
    //chooses whether clicking or touching causes UI elements to change
    var event = 'click';
        if(pc.platform.mobile) {
            event = 'touchstart'; 
        }
    // if (UI.button) {
    //     //SUBMIT BUTTON LISTENER
    //     UI.button.addEventListener(event, function() {
    //         self.updateSounds();
    //     }, false);
    // }
    if (UI.stethButton) {
        UI.stethButton.addEventListener(event, function() {
            self.app.listening = !self.app.listening;
        }, false);
    }

};

Ui.prototype.updateSounds = function() {
    
    var changed = false;
    
    if (UI.respRate && UI.bpm && UI.bpmSlider && UI.respSlider){
        this.app.bpm = UI.bpmSlider.value;
        this.app.respRate = UI.respSlider.value;
    }

    if (UI.heartSelect && UI.lungSelect){
        
        this.app.heartSelect = UI.heartSelect.value;
        this.app.lungSelect = UI.lungSelect.value;

    }

    console.log("Updated UI settings");
    console.log(UI.lungSelect.value);
    if (this.app.set){
        this.app.fire("stopSound");
    }
    this.app.fire("soundSet");
    

    this.app.set = true;
    this.app.heartCounter = 0;
    this.app.lungCounter = (60/this.app.respRate) - 1; //plays in one second
};