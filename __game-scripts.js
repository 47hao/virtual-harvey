var TouchInput = pc.createScript("touchInput");
TouchInput.attributes.add("orbitSensitivity", {
    type: "number",
    default: .4,
    title: "Orbit Sensitivity",
    description: "How fast the camera moves around the orbit. Higher is faster"
}), TouchInput.attributes.add("distanceSensitivity", {
    type: "number",
    default: .2,
    title: "Distance Sensitivity",
    description: "How fast the camera moves in and out. Higher is faster"
}), TouchInput.prototype.initialize = function() {
    this.orbitCamera = this.entity.script.orbitCamera, this.lastTouchPoint = new pc.Vec2, this.lastPinchMidPoint = new pc.Vec2, this.lastPinchDistance = 0, this.orbitCamera && this.app.touch && (this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this), this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this), this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this), this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this), this.on("destroy", (function() {
        this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this), this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this), this.app.touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this), this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this)
    })))
}, TouchInput.prototype.getPinchDistance = function(t, i) {
    var o = t.x - i.x,
        n = t.y - i.y;
    return Math.sqrt(o * o + n * n)
}, TouchInput.prototype.calcMidPoint = function(t, i, o) {
    o.set(i.x - t.x, i.y - t.y), o.scale(.5), o.x += t.x, o.y += t.y
}, TouchInput.prototype.onTouchStartEndCancel = function(t) {
    var i = t.touches;
    1 == i.length ? this.lastTouchPoint.set(i[0].x, i[0].y) : 2 == i.length && (this.lastPinchDistance = this.getPinchDistance(i[0], i[1]), this.calcMidPoint(i[0], i[1], this.lastPinchMidPoint))
}, TouchInput.fromWorldPoint = new pc.Vec3, TouchInput.toWorldPoint = new pc.Vec3, TouchInput.worldDiff = new pc.Vec3, TouchInput.prototype.pan = function(t) {
    var i = TouchInput.fromWorldPoint,
        o = TouchInput.toWorldPoint,
        n = TouchInput.worldDiff,
        h = this.entity.camera,
        c = this.orbitCamera.distance;
    h.screenToWorld(t.x, t.y, c, i), h.screenToWorld(this.lastPinchMidPoint.x, this.lastPinchMidPoint.y, c, o), n.sub2(o, i), this.orbitCamera.pivotPoint.add(n)
}, TouchInput.pinchMidPoint = new pc.Vec2, TouchInput.prototype.onTouchMove = function(t) {
    var i = TouchInput.pinchMidPoint,
        o = t.touches;
    if (1 == o.length) {
        var n = o[0];
        this.orbitCamera.pitch -= (n.y - this.lastTouchPoint.y) * this.orbitSensitivity, this.orbitCamera.yaw -= (n.x - this.lastTouchPoint.x) * this.orbitSensitivity, this.lastTouchPoint.set(n.x, n.y)
    } else if (2 == o.length) {
        var h = this.getPinchDistance(o[0], o[1]),
            c = h - this.lastPinchDistance;
        this.lastPinchDistance = h, this.orbitCamera.distance -= c * this.distanceSensitivity * .1 * (.1 * this.orbitCamera.distance), this.calcMidPoint(o[0], o[1], i), this.pan(i), this.lastPinchMidPoint.copy(i)
    }
};
var OrbitCamera = pc.createScript("orbitCamera");
OrbitCamera.attributes.add("distanceMax", {
    type: "number",
    default: 0,
    title: "Distance Max",
    description: "Setting this at 0 will give an infinite distance limit"
}), OrbitCamera.attributes.add("distanceMin", {
    type: "number",
    default: 0,
    title: "Distance Min"
}), OrbitCamera.attributes.add("pitchAngleMax", {
    type: "number",
    default: 90,
    title: "Pitch Angle Max (degrees)"
}), OrbitCamera.attributes.add("pitchAngleMin", {
    type: "number",
    default: -90,
    title: "Pitch Angle Min (degrees)"
}), OrbitCamera.attributes.add("inertiaFactor", {
    type: "number",
    default: 0,
    title: "Inertia Factor",
    description: "Higher value means that the camera will continue moving after the user has stopped dragging. 0 is fully responsive."
}), OrbitCamera.attributes.add("focusEntity", {
    type: "entity",
    title: "Focus Entity",
    description: "Entity for the camera to focus on. If blank, then the camera will use the whole scene"
}), OrbitCamera.attributes.add("frameOnStart", {
    type: "boolean",
    default: !0,
    title: "Frame on Start",
    description: 'Frames the entity or scene at the start of the application."'
}), Object.defineProperty(OrbitCamera.prototype, "distance", {
    get: function() {
        return this._targetDistance
    },
    set: function(t) {
        this._targetDistance = this._clampDistance(t)
    }
}), Object.defineProperty(OrbitCamera.prototype, "pitch", {
    get: function() {
        return this._targetPitch
    },
    set: function(t) {
        this._targetPitch = this._clampPitchAngle(t)
    }
}), Object.defineProperty(OrbitCamera.prototype, "yaw", {
    get: function() {
        return this._targetYaw
    },
    set: function(t) {
        this._targetYaw = t;
        var i = (this._targetYaw - this._yaw) % 360;
        this._targetYaw = i > 180 ? this._yaw - (360 - i) : i < -180 ? this._yaw + (360 + i) : this._yaw + i
    }
}), Object.defineProperty(OrbitCamera.prototype, "pivotPoint", {
    get: function() {
        return this._pivotPoint
    },
    set: function(t) {
        this._pivotPoint.copy(t)
    }
}), OrbitCamera.prototype.focus = function(t) {
    this._buildAabb(t, 0);
    var i = this._modelsAabb.halfExtents,
        e = Math.max(i.x, Math.max(i.y, i.z));
    e /= Math.tan(.5 * this.entity.camera.fov * pc.math.DEG_TO_RAD), e *= 2, this.distance = e, this._removeInertia(), this._pivotPoint.copy(this._modelsAabb.center)
}, OrbitCamera.distanceBetween = new pc.Vec3, OrbitCamera.prototype.resetAndLookAtPoint = function(t, i) {
    this.pivotPoint.copy(i), this.entity.setPosition(t), this.entity.lookAt(i);
    var e = OrbitCamera.distanceBetween;
    e.sub2(i, t), this.distance = e.length(), this.pivotPoint.copy(i);
    var a = this.entity.getRotation();
    this.yaw = this._calcYaw(a), this.pitch = this._calcPitch(a, this.yaw), this._removeInertia(), this._updatePosition()
}, OrbitCamera.prototype.resetAndLookAtEntity = function(t, i) {
    this._buildAabb(i, 0), this.resetAndLookAtPoint(t, this._modelsAabb.center)
}, OrbitCamera.prototype.reset = function(t, i, e) {
    this.pitch = i, this.yaw = t, this.distance = e, this._removeInertia()
}, OrbitCamera.prototype.initialize = function() {
    var t = this,
        onWindowResize = function() {
            t._checkAspectRatio()
        };
    window.addEventListener("resize", onWindowResize, !1), this._checkAspectRatio(), this._modelsAabb = new pc.BoundingBox, this._buildAabb(this.focusEntity || this.app.root, 0), this.entity.lookAt(this._modelsAabb.center), this._pivotPoint = new pc.Vec3, this._pivotPoint.copy(this._modelsAabb.center);
    var i = this.entity.getRotation();
    if (this._yaw = this._calcYaw(i), this._pitch = this._clampPitchAngle(this._calcPitch(i, this._yaw)), this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0), this._distance = 0, this._targetYaw = this._yaw, this._targetPitch = this._pitch, this.frameOnStart) this.focus(this.focusEntity || this.app.root);
    else {
        var e = new pc.Vec3;
        e.sub2(this.entity.getPosition(), this._pivotPoint), this._distance = this._clampDistance(e.length())
    }
    this._targetDistance = this._distance, this.on("attr:distanceMin", (function(t, i) {
        this._targetDistance = this._clampDistance(this._distance)
    })), this.on("attr:distanceMax", (function(t, i) {
        this._targetDistance = this._clampDistance(this._distance)
    })), this.on("attr:pitchAngleMin", (function(t, i) {
        this._targetPitch = this._clampPitchAngle(this._pitch)
    })), this.on("attr:pitchAngleMax", (function(t, i) {
        this._targetPitch = this._clampPitchAngle(this._pitch)
    })), this.on("attr:focusEntity", (function(t, i) {
        this.frameOnStart ? this.focus(t || this.app.root) : this.resetAndLookAtEntity(this.entity.getPosition(), t || this.app.root)
    })), this.on("attr:frameOnStart", (function(t, i) {
        t && this.focus(this.focusEntity || this.app.root)
    })), this.on("destroy", (function() {
        window.removeEventListener("resize", onWindowResize, !1)
    }))
}, OrbitCamera.prototype.update = function(t) {
    var i = 0 === this.inertiaFactor ? 1 : Math.min(t / this.inertiaFactor, 1);
    this._distance = pc.math.lerp(this._distance, this._targetDistance, i), this._yaw = pc.math.lerp(this._yaw, this._targetYaw, i), this._pitch = pc.math.lerp(this._pitch, this._targetPitch, i), this._updatePosition()
}, OrbitCamera.prototype._updatePosition = function() {
    this.entity.setLocalPosition(0, 0, 0), this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);
    var t = this.entity.getPosition();
    t.copy(this.entity.forward), t.scale(-this._distance), t.add(this.pivotPoint), this.entity.setPosition(t)
}, OrbitCamera.prototype._removeInertia = function() {
    this._yaw = this._targetYaw, this._pitch = this._targetPitch, this._distance = this._targetDistance
}, OrbitCamera.prototype._checkAspectRatio = function() {
    var t = this.app.graphicsDevice.height,
        i = this.app.graphicsDevice.width;
    this.entity.camera.horizontalFov = t > i
}, OrbitCamera.prototype._buildAabb = function(t, i) {
    var e = 0;
    if (t.model) {
        console.log("Entity name: " + t.name);
        var a = t.model.meshInstances;
        for (e = 0; e < a.length; e++) 0 === i ? this._modelsAabb.copy(a[e].aabb) : this._modelsAabb.add(a[e].aabb), i += 1
    }
    for (e = 0; e < t.children.length; ++e) i += this._buildAabb(t.children[e], i);
    return i
}, OrbitCamera.prototype._calcYaw = function(t) {
    var i = new pc.Vec3;
    return t.transformVector(pc.Vec3.FORWARD, i), Math.atan2(-i.x, -i.z) * pc.math.RAD_TO_DEG
}, OrbitCamera.prototype._clampDistance = function(t) {
    return this.distanceMax > 0 ? pc.math.clamp(t, this.distanceMin, this.distanceMax) : Math.max(t, this.distanceMin)
}, OrbitCamera.prototype._clampPitchAngle = function(t) {
    return pc.math.clamp(t, -this.pitchAngleMax, -this.pitchAngleMin)
}, OrbitCamera.quatWithoutYaw = new pc.Quat, OrbitCamera.yawOffset = new pc.Quat, OrbitCamera.prototype._calcPitch = function(t, i) {
    var e = OrbitCamera.quatWithoutYaw,
        a = OrbitCamera.yawOffset;
    a.setFromEulerAngles(0, -i, 0), e.mul2(a, t);
    var s = new pc.Vec3;
    return e.transformVector(pc.Vec3.FORWARD, s), Math.atan2(s.y, -s.z) * pc.math.RAD_TO_DEG
};
var KeyboardInput = pc.createScript("keyboardInput");
KeyboardInput.prototype.initialize = function() {
    this.orbitCamera = this.entity.script.orbitCamera
}, KeyboardInput.prototype.postInitialize = function() {
    this.orbitCamera && (this.startDistance = this.orbitCamera.distance, this.startYaw = this.orbitCamera.yaw, this.startPitch = this.orbitCamera.pitch, this.startPivotPosition = this.orbitCamera.pivotPoint.clone())
}, KeyboardInput.prototype.update = function(t) {
    this.orbitCamera && this.app.keyboard.wasPressed(pc.KEY_SPACE) && (this.orbitCamera.reset(this.startYaw, this.startPitch, this.startDistance), this.orbitCamera.pivotPoint = this.startPivotPosition)
};
var sound, slots, touchSurface = pc.createScript("touchSurface");
touchSurface.prototype.initialize = function() {
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.mouseDown, this), sound = this.entity.sound, slots = Object.keys(sound.slots)
}, touchSurface.prototype.mouseDown = function(t) {
    this.doRaycast(t)
}, touchSurface.prototype.distance = function(t, s) {
    return (t.x - s.x) * (t.x - s.x) + (t.y - s.y) * (t.y - s.y) + (t.z - s.z) * (t.z - s.z)
}, touchSurface.prototype.doRaycast = function(t) {
    var s = this.app.systems.camera.cameras[0].entity.getPosition(),
        o = this.app.systems.camera.cameras[0].screenToWorld(t.x, t.y, this.app.systems.camera.cameras[0].farClip),
        e = this.app.systems.rigidbody.raycastAll(s, o),
        a = null,
        c = -1;
    for (i = 0; i < e.length; i++) "BodyModel" == e[i].entity.name && (dist = this.distance(s, e[i].point), (-1 == c || dist < c) && (c = dist, a = e[i]));
    if (null !== a) {
        sound.play(slots[0]);
        a.point;
        this.app.fire("moveMarker", a.point)
    }
};
var MouseInput = pc.createScript("mouseInput");
MouseInput.attributes.add("orbitSensitivity", {
    type: "number",
    default: .3,
    title: "Orbit Sensitivity",
    description: "How fast the camera moves around the orbit. Higher is faster"
}), MouseInput.attributes.add("distanceSensitivity", {
    type: "number",
    default: .15,
    title: "Distance Sensitivity",
    description: "How fast the camera moves in and out. Higher is faster"
}), MouseInput.prototype.initialize = function() {
    if (this.orbitCamera = this.entity.script.orbitCamera, this.orbitCamera) {
        var t = this,
            onMouseOut = function(o) {
                t.onMouseOut(o)
            };
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this), this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this), this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this), window.addEventListener("mouseout", onMouseOut, !1), this.on("destroy", (function() {
            this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this), this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this), this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this), window.removeEventListener("mouseout", onMouseOut, !1)
        }))
    }
    this.app.mouse.disableContextMenu(), this.lookButtonDown = !1, this.panButtonDown = !1, this.lastPoint = new pc.Vec2
}, MouseInput.fromWorldPoint = new pc.Vec3, MouseInput.toWorldPoint = new pc.Vec3, MouseInput.worldDiff = new pc.Vec3, MouseInput.prototype.pan = function(t) {
    var o = MouseInput.fromWorldPoint,
        e = MouseInput.toWorldPoint,
        i = MouseInput.worldDiff,
        s = this.entity.camera,
        n = this.orbitCamera.distance;
    s.screenToWorld(t.x, t.y, n, o), s.screenToWorld(this.lastPoint.x, this.lastPoint.y, n, e), i.sub2(e, o), this.orbitCamera.pivotPoint.add(i)
}, MouseInput.prototype.onMouseDown = function(t) {
    switch (t.button) {
        case pc.MOUSEBUTTON_LEFT:
            break;
        case pc.MOUSEBUTTON_MIDDLE:
        case pc.MOUSEBUTTON_RIGHT:
            this.lookButtonDown = !0
    }
}, MouseInput.prototype.onMouseUp = function(t) {
    switch (t.button) {
        case pc.MOUSEBUTTON_LEFT:
            break;
        case pc.MOUSEBUTTON_MIDDLE:
        case pc.MOUSEBUTTON_RIGHT:
            this.lookButtonDown = !1
    }
}, MouseInput.prototype.onMouseMove = function(t) {
    pc.app.mouse;
    this.lookButtonDown ? (this.orbitCamera.pitch -= t.dy * this.orbitSensitivity, this.orbitCamera.yaw -= t.dx * this.orbitSensitivity) : this.panButtonDown && this.pan(t), this.lastPoint.set(t.x, t.y)
}, MouseInput.prototype.onMouseWheel = function(t) {
    this.orbitCamera.distance -= t.wheel * this.distanceSensitivity * (.1 * this.orbitCamera.distance), t.event.preventDefault()
}, MouseInput.prototype.onMouseOut = function(t) {
    this.lookButtonDown = !1, this.panButtonDown = !1
};
var CollisionSound = pc.createScript("collisionSound");
CollisionSound.prototype.initialize = function() {
    this.entity.collision.on("triggerenter", this.onTriggerEnter, this), this.entity.collision.on("triggerleave", this.onTriggerLeave, this), this.app.on("soundSet", this.setSound, this), this.app.on("stopSound", this.stopSound, this), this.entity.tags.has("Heart") ? this.app.on("beat", this.onPulse, this) : this.entity.tags.has("Lung") && this.app.on("breath", this.onPulse, this), this.entity.slots = Object.keys(this.entity.sound.slots), this.entity.inZone = !1, this.loadSounds()
}, CollisionSound.prototype.update = function(t) {
    (this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT) || this.app.listening) && this.entity.inZone ? this.raiseVolume() : this.lowerVolume()
}, CollisionSound.prototype.stopSound = function(t) {
    this.entity.track && (console.log("STOPPING REAL SOUND"), this.entity.track.stop())
}, CollisionSound.prototype.loadSounds = function(t) {
    var s = {
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
        insp_exp_crackles: this.app.assets.get(40799138)
    };
    for (var e in s) this.entity.sound.addSlot(e, {
        asset: s[e]
    })
}, CollisionSound.prototype.onPulse = function(t) {
    this.entity.track && (console.log("Playing"), this.entity.track.play())
}, CollisionSound.prototype.lowerVolume = function() {
    if (null !== this.entity.track && this.entity.track)
        for (var t = 0; t < this.entity.track.instances.length; t++) this.entity.track.instances[t].volume = 0
}, CollisionSound.prototype.raiseVolume = function() {
    if (null !== this.entity.track && this.entity.track)
        for (var t = 0; t < this.entity.track.instances.length; t++) this.entity.tags.has("Heart") ? this.entity.track.instances[t].volume = 1 : this.entity.track.instances[t].volume = .3
}, CollisionSound.prototype.onTriggerEnter = function(t) {
    this.entity.inZone = !0
}, CollisionSound.prototype.onTriggerLeave = function(t) {
    this.entity.inZone = !1
}, CollisionSound.prototype.setSound = function(t) {
    if (this.entity.tags.has("Heart"))
        if ("None" == this.app.heartSelect) this.entity.track = null;
        else {
            var s = this.entity.tags.list()[1].toLowerCase() + this.app.heartSelect.substring(0, 2);
            console.log("loading track" + s), this.entity.track = this.entity.sound.slot(s), this.entity.track && console.log("success!")
        }
    else this.entity.tags.has("Lung") && (console.log("Setting lung: " + this.app.lungSelect), "None" == this.app.lungSelect ? this.entity.track = null : "Exp Wheeze" == this.app.lungSelect ? this.entity.track = this.entity.sound.slot("ex_wheeze_15") : "Insp Crackles" == this.app.lungSelect ? this.entity.track = this.entity.sound.slot("insp_crackles") : "Vesicular" == this.app.lungSelect ? this.entity.track = this.entity.sound.slot("vesicular") : "Wheeze" == this.app.lungSelect ? this.entity.track = this.entity.sound.slot("wheeze") : "Insp Exp Crackles" == this.app.lungSelect ? this.entity.track = this.entity.sound.slot("insp_exp_crackles") : "Rub" == this.app.lungSelect && (this.entity.track = this.entity.sound.slot("rub")))
};
var Collider = pc.createScript("collider");
Collider.prototype.initialize = function() {
    this.entity.collision.on("collisionstart", this.onCollisionStart, this)
}, Collider.prototype.onCollisionStart = function(o) {
    o.other.rigidbody && console.log("HIT THING")
};
var entity, stethoscope = pc.createScript("stethscope");
stethoscope.prototype.initialize = function() {
    console.log("Script Loaded"), this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.mouseDown, this), this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.mouseMove, this), this.app.mouse.on(pc.EVENT_MOUSEUP, this.mouseUp, this), entity = this.entity, this.app.counter = 0
}, stethoscope.prototype.update = function(t) {
    this.app.heartCounter += t, this.app.heartCounter >= 60 / this.app.bpm && (this.app.fire("beat", this.app.heartCounter), this.app.heartCounter = 0), this.app.lungCounter += t, this.app.lungCounter >= 60 / this.app.respRate && (this.app.fire("breath", this.app.lungCounter), this.app.lungCounter = 0), this.app.listening && (entity.model.material.opacity = 1, entity.model.material.diffuse = new pc.Color(.4, .7, 1), entity.model.material.update())
}, stethoscope.prototype.distance = function(t, e) {
    return (t.x - e.x) * (t.x - e.x) + (t.y - e.y) * (t.y - e.y) + (t.z - e.z) * (t.z - e.z)
}, stethoscope.prototype.mouseMove = function(t) {
    this.doRaycast(t)
}, stethoscope.prototype.mouseDown = function(t) {
    this.app.onBody && t.button === pc.MOUSEBUTTON_LEFT && (entity.model.material.opacity = 1, entity.model.material.diffuse = new pc.Color(.4, .7, 1), entity.model.material.update())
}, stethoscope.prototype.mouseUp = function(t) {
    entity.model.material.opacity = .7, entity.model.material.diffuse = new pc.Color(0, 0, 0), entity.model.material.update()
}, stethoscope.prototype.doRaycast = function(t) {
    var e = this.app.systems.camera.cameras[0].entity.getPosition(),
        o = this.app.systems.camera.cameras[0].screenToWorld(t.x, t.y, this.app.systems.camera.cameras[0].farClip),
        p = this.app.systems.rigidbody.raycastAll(e, o),
        s = null,
        a = -1;
    for (i = 0; i < p.length; i++) "BodyModel" == p[i].entity.name && (dist = this.distance(e, p[i].point), (-1 == a || dist < a) && (a = dist, s = p[i]));
    if (s) {
        var n = s.point;
        entity.setPosition(n.x, n.y, n.z), this.app.fire("stethMoved"), this.app.onBody = !0
    } else this.app.onBody = !1
};
var UI, Ui = pc.createScript("ui");
Ui.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}), Ui.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}), Ui.attributes.add("mobileHtml", {
    type: "asset",
    assetType: "html",
    title: "mobile HTML Asset"
}), Ui.prototype.initialize = function() {
    this.app.set = !1;
    var e = document.createElement("style");
    document.head.appendChild(e), e.innerHTML = this.css.resource || "", this.div = document.createElement("div"), pc.platform.mobile ? (this.div.classList.add("mobileContainer"), this.div.innerHTML = this.mobileHtml.resource || "") : (this.div.classList.add("container"), this.div.innerHTML = this.html.resource || ""), document.body.appendChild(this.div), this.bindEvents()
}, Ui.prototype.bindEvents = function() {
    var e = this;
    (UI = {
        bpmSlider: this.div.querySelector(".bpmSlider"),
        respSlider: this.div.querySelector(".respSlider"),
        bpm: this.div.querySelector(".bpm"),
        respRate: this.div.querySelector(".respRate"),
        button: this.div.querySelector(".button"),
        stethButton: this.div.querySelector(".stethButton"),
        heartSelect: this.div.querySelector(".heartSelect"),
        lungSelect: this.div.querySelector(".lungSelect")
    }).heartSelect.onchange = e.updateSounds(), UI.lungSelect.onchange = e.updateSounds();
    var t = "mousemove";
    pc.platform.mobile && (t = "touchmove"), UI.bpmSlider && UI.bpmSlider.addEventListener("change", (function() {
        UI.bpm && (console.log("VALUE CHANGE"), UI.bpm.textContent = UI.bpmSlider.value, e.updateSounds())
    })), UI.respSlider && UI.respSlider.addEventListener("change", (function() {
        UI.respRate && (UI.respRate.textContent = UI.respSlider.value, e.updateSounds())
    })), UI.respSlider && UI.respSlider.addEventListener(t, (function() {
        UI.respRate && (UI.respRate.textContent = UI.respSlider.value)
    })), UI.bpmSlider && UI.bpmSlider.addEventListener(t, (function() {
        UI.bpm && (UI.bpm.textContent = UI.bpmSlider.value)
    })), UI.heartSelect && UI.heartSelect.addEventListener("change", (function() {
        e.updateSounds()
    })), UI.lungSelect && UI.lungSelect.addEventListener("change", (function() {
        e.updateSounds()
    }));
    var i = "click";
    pc.platform.mobile && (i = "touchstart"), UI.stethButton && UI.stethButton.addEventListener(i, (function() {
        e.app.listening = !e.app.listening
    }), !1)
}, Ui.prototype.updateSounds = function() {
    UI.respRate && UI.bpm && UI.bpmSlider && UI.respSlider && (this.app.bpm = UI.bpmSlider.value, this.app.respRate = UI.respSlider.value), UI.heartSelect && UI.lungSelect && (this.app.heartSelect = UI.heartSelect.value, this.app.lungSelect = UI.lungSelect.value), console.log("Updated UI settings"), console.log(UI.lungSelect.value), this.app.set && this.app.fire("stopSound"), this.app.fire("soundSet"), this.app.set = !0, this.app.heartCounter = 0, this.app.lungCounter = 60 / this.app.respRate - 1
};