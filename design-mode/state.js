// function Light() {
//     this.state = 'level1';
// }

// Light.prototype.triggerLight = function () {
//     if (this.state === 'level1') {
//         console.log('level1');
//         this.state = 'level2';
//     } else if (this.state === 'level2') {
//         console.log('level2');
//         this.state = 'level3';
//     } else if (this.state === 'level3') {
//         console.log('level3');
//         this.state = 'level1';
//     }
// };

// const light = new Light();
// light.triggerLight();
// light.triggerLight();
// light.triggerLight();

function LightLevel1(light) {
    this.light = light;
}
LightLevel1.prototype.triggerLight = function () {
    console.log('level1');
    this.light.setState(this.light.level2State);
};

function LightLevel2(light) {
    this.light = light;
}
LightLevel2.prototype.triggerLight = function () {
    console.log('level2');
    this.light.setState(this.light.level3State);
};

function LightLevel3(light) {
    this.light = light;
}

LightLevel3.prototype.triggerLight = function () {
    console.log('level3');
    this.light.setState(this.light.level1State);
};

function Light() {
    this.level1State = new LightLevel1(this);
    this.level2State = new LightLevel2(this);
    this.level3State = new LightLevel3(this);
    this.curLight = this.level1State; // 初始化当前调用对象
}

Light.prototype.setState = function (state) {
    this.curLight = state;
};

Light.prototype.triggerLight = function () {
    this.curLight.triggerLight();
};

const light = new Light();
light.triggerLight();
light.triggerLight();
light.triggerLight();
