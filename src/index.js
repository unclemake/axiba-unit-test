"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
class TestCaseList {
    /**
     * 构造函数
     * @param testFunction 测试方法
     */
    constructor(testFunction) {
        /** 测试列表*/
        this.testList = [];
        this.testFunction = testFunction;
    }
    /**
     * 添加测试数据
     * @param arg 测试数据
     * @param run 测试方法
     */
    add(arg, run) {
        this.testList.push({
            arg: arg, run: run
        });
    }
    /**
     *  运行测试
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let errorStr = '';
            for (let i in this.testList) {
                let value = this.testList[i];
                let noNumber = parseInt(i) + 1;
                try {
                    let str = yield this.testFunction(...value.arg);
                    value.run(str) || (errorStr += noNumber + ': ' + str + '\n\r');
                }
                catch (e) {
                    errorStr += noNumber + ': ' + e + '\n\r';
                }
            }
            return errorStr;
        });
    }
}
exports.TestCaseList = TestCaseList;
/**
 * 测试单元类 T 测试方法体 Y 参数 Z 返回值
 */
class TestUnit {
    /**
     * 构造函数
     * @param name 单元名
     * @param testFunctionction 单元函数
     */
    constructor(name, testFunctionction = (arg => arg)) {
        /** 默认超时 */
        this.overtime = 3000;
        /** 测试参数数组 */
        this.testList = [];
        this.name = name;
        this.testFunctionction = testFunctionction;
    }
    /**
     * 添加测试
     * @param argument 参数
     * @param comparisonFunction 测试函数返回值 比对函数
     * @param overtime 超时时间
     */
    add(argument, comparisonFunction, overtime = this.overtime) {
        this.testList.push({ argument: argument, comparisonFunction: comparisonFunction, overtime: overtime });
        return this;
    }
    /**
     * 测速
     *
     * @param {() => any} fun
     * @returns {Promise<number>}
     * @memberof TestUnit
     */
    performanceTest(fun) {
        return __awaiter(this, void 0, Promise, function* () {
            let start = new Date().getTime(); //起始时间
            yield fun();
            var end = new Date().getTime(); //接受时间
            return end - start;
        });
    }
    ;
    /**
     * 单个测试测试
     * @param testM
     */
    testOne(testM) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let error = '';
            let { argument, comparisonFunction, overtime } = testM;
            try {
                //函数卡死的跳出
                let st;
                if (overtime) {
                    st = setTimeout(() => {
                        resolve('函数运行超时');
                    }, overtime);
                }
                let rValue;
                let time = yield this.performanceTest(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        rValue = yield this.testFunctionction(...argument);
                    }
                    catch (error) {
                        clearTimeout(st);
                        resolve(error);
                    }
                    return;
                }));
                if (time > overtime) {
                    resolve('函数运行超时');
                }
                clearTimeout(st);
                st = setTimeout(() => {
                    resolve('比对函数运行超时');
                }, this.overtime);
                let val;
                try {
                    val = yield comparisonFunction(rValue);
                }
                catch (e) {
                    clearTimeout(st);
                    resolve(e);
                }
                clearTimeout(st);
                if (typeof val == 'boolean') {
                    error = val ? '' : '判断错误,返回值:' + JSON.stringify(rValue);
                }
                else if (typeof val == 'string') {
                    error = val;
                }
            }
            catch (e) {
                error = e;
            }
            resolve(error);
        }));
    }
    /**
    * 运行 测试
    */
    run() {
        return __awaiter(this, void 0, Promise, function* () {
            let [pass, error] = [0, ''];
            for (let i in this.testList) {
                let str = yield this.testOne(this.testList[i]);
                if (str) {
                    error += (parseInt(i) + 1) + ': ' + str + '\r\n';
                }
                else {
                    pass++;
                }
            }
            return {
                all: this.testList.length,
                pass: pass,
                error: error
            };
        });
    }
}
exports.TestUnit = TestUnit;
/**
* 测试模块
*/
class TestModule {
    /**
  * 构造函数
  * @param testFunction 测试方法
  */
    constructor(name) {
        /** 测试参数数组 */
        this.testUnitArray = [];
        this.name = name;
    }
    /**
     * 添加测试单元
     * @param testUnit
     */
    add(testUnit) {
        this.testUnitArray.push(testUnit);
    }
    /**
   * 运行 测试
   */
    run() {
        return __awaiter(this, void 0, Promise, function* () {
            let [all, pass, fail, resultArray] = [0, 0, 0, []];
            let error = `\n----错误----\n`;
            util.log('运行模块：' + this.name);
            for (let i in this.testUnitArray) {
                all++;
                let value = this.testUnitArray[i];
                // util.warn(`？ ${value.name}`);
                let obj = yield value.run();
                resultArray.push(obj);
                if (obj.all == obj.pass) {
                    util.log(`√ ${value.name}`);
                    pass++;
                }
                else {
                    util.error(`× ${value.name}`);
                    fail++;
                    error += value.name + '\n';
                    error += obj.error;
                }
            }
            let log = `\n全部:${all}  通过:${pass} 未通过: ${fail}`;
            util.log(log);
            if (all - pass !== 0) {
                error += `----错误----\n`;
                util.error(error);
            }
            util.log(`______________________________  \n`);
            return {
                all: all, pass: pass, error: error, resultArray: resultArray
            };
        });
    }
}
exports.TestModule = TestModule;
/** 无泛型单元测试 */
class TestUnitEasy extends TestUnit {
}
/** 记录单元测试模块 */
let testModule;
/** 记录单元测试模块组 */
let testModuleList = [];
/** 创建单元测试模块 */
function describe(name, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        testModule = new TestModule(name);
        cb();
        testModuleList.push(testModule);
    });
}
exports.describe = describe;
/** 创建单元测试 */
function it(name, cb) {
    testModule.add(new TestUnitEasy(name).add([0], (arg) => cb()));
    cb();
}
exports.it = it;
/** 创建多参数单元测试 */
function its(name, testFunction, cb) {
    let testUnit = new TestUnitEasy(name, testFunction);
    testModule.add(testUnit);
    exports.itAdd = testUnit.add.bind(testUnit);
    cb();
}
exports.its = its;
/** 运行测试用例  */
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let key in testModuleList) {
            let element = testModuleList[key];
            yield element.run();
        }
        // util.createLogFile();
    });
}
exports.run = run;
let testObj;
function describeClass(name, testObjNow, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        testModule = new TestModule(name);
        testObj = testObjNow;
        cb();
        testModuleList.push(testModule);
    });
}
exports.describeClass = describeClass;
/** 创建多参数单元测试 */
function itClass(name, cb, nameAs) {
    if (!testObj[name]) {
        util.warn(`${name} key不存在`);
        return;
    }
    let testUnit = new TestUnitEasy(nameAs || name, testObj[name].bind(testObj));
    testModule.add(testUnit);
    exports.itAdd = testUnit.add.bind(testUnit);
    cb();
}
exports.itClass = itClass;
class util {
    static warn(str) {
        console.warn(str);
    }
    static log(str) {
        console.log(str);
    }
    static error(str) {
        console.error(str);
    }
}

//# sourceMappingURL=index.js.map
