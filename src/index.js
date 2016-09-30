"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const axiba_util_1 = require('axiba-util');
const readline = require('readline');
let util = new axiba_util_1.Util();
class TestCaseList {
    /**
     * 构造函数
     * @param testFun 测试方法
     */
    constructor(testFun) {
        /** 测试列表*/
        this.testList = [];
        this.testFun = testFun;
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
                    let str = yield this.testFun(...value.arg);
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
class Test {
    constructor() {
        //测试用例数组
        this.caseModuleArray = [];
    }
    /**
     * 添加测试用例
     * @param testModule
     */
    add(title, caseArray = []) {
        let testModule = this.caseModuleArray.find(value => value.title == title);
        if (testModule) {
            testModule.caseArray = testModule.caseArray.concat(caseArray);
        }
        else {
            testModule = {
                title: title, caseArray: caseArray
            };
            this.caseModuleArray.push(testModule);
        }
        return (title, testFunCase, overtime) => {
            let listClass = new TestCaseList((value) => {
                if (testFunCase) {
                    return testFunCase(value);
                }
                else {
                    return null;
                }
            });
            testModule.caseArray.push({
                title: title,
                overtime: overtime,
                run: () => listClass.run()
            });
            return listClass;
        };
    }
    /**
     * 运行所有测试用例
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (let value of this.caseModuleArray) {
                    let passNu = 0, failNu = 0;
                    util.log(value.title);
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    for (let i in value.caseArray) {
                        let testCase = value.caseArray[i];
                        let result = yield this.test(testCase);
                        testCase.result = result;
                        result.passed ? passNu++ : failNu++;
                        rl.write(null, { ctrl: true, name: 'u' });
                        let logStr = '总数:' + value.caseArray.length + ' 通过:' + passNu.toString() + " 未通过:" + failNu.toString() + '';
                        if (parseInt(i) === value.caseArray.length - 1) {
                            util.log(logStr);
                        }
                        else {
                            rl.write(logStr);
                        }
                    }
                    rl.close();
                    util.log(' ');
                    util.log(' ');
                    util.log(' ');
                    for (let testCase of value.caseArray) {
                        if (!testCase.result.passed) {
                            util.error(testCase.title);
                            util.log(testCase.result.txt);
                            util.log('');
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    /**
     * 单个测试是否通过
     * @param testCase
     */
    test(testCase) {
        return __awaiter(this, void 0, Promise, function* () {
            let bl = yield this.overtimeFun(() => {
                try {
                    return testCase.run();
                }
                catch (e) {
                    return e;
                }
            }, testCase.overtime);
            if (typeof bl == 'boolean') {
                if (bl) {
                    return { passed: true, txt: '成功' };
                }
                else {
                    return { passed: false, txt: '失败' };
                }
            }
            else if (typeof bl == 'string') {
                if (bl === '') {
                    return { passed: true, txt: '成功' };
                }
                else {
                    return { passed: false, txt: String(bl) };
                }
            }
            else {
                return { passed: false, txt: String(bl) };
            }
        });
    }
    /**
     * 生成文档
     * @param path
     */
    creatDoc(path = './testdoc.txt') {
        util.createLogFile(path);
    }
}
exports.Test = Test;
/**
 * 测试单元类 T 测试方法体 Y 参数 Z 返回值
 */
class TestUnit {
    /**
     * 构造函数
     * @param name 单元名
     * @param testFunction 单元函数
     */
    constructor(name, testFunction = (arg => arg)) {
        /** 默认超时 */
        this.overtime = 3000;
        /** 测试参数数组 */
        this.testList = [];
        this.name = name;
        this.testFunction = testFunction;
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
                let time = yield util.performanceTest(() => __awaiter(this, void 0, void 0, function* () {
                    rValue = yield this.testFunction(...argument);
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
                    error = val ? '' : '判断函数false,result:' + JSON.stringify(rValue);
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
        return __awaiter(this, void 0, void 0, function* () {
            let [all, pass, error] = [0, 0, 0];
            util.log('当前运行模块：' + this.name);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            for (let i in this.testUnitArray) {
                rl.write(null, { ctrl: true, name: 'u' });
                all++;
                let value = this.testUnitArray[i];
                let obj = yield value.run();
                if (obj.all == obj.pass) {
                    pass++;
                }
                else {
                    error++;
                }
                let tpl = `全部:${all}  通过:${pass} 未通过:${error}  剩余:${all - pass - error}
                       正在运行：${value.name}`;
                rl.write(tpl);
            }
            rl.close();
            util.log('模块' + this.name + '测试完毕');
            return {};
        });
    }
}
exports.TestModule = TestModule;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new Test();
