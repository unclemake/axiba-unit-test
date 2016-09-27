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
class Test {
    constructor() {
        //测试用例数组
        this.caseArray = [];
    }
    /**
     * 添加测试用例
     * @param testModule
     */
    push(testModule) {
        let testModuleGet = this.caseArray.find(value => value.title == testModule.title);
        if (testModuleGet) {
            testModuleGet.caseArray = testModuleGet.caseArray.concat(testModule.caseArray);
        }
        else {
            this.caseArray.push(testModule);
        }
    }
    /**
     * 运行所有测试用例
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (let value of this.caseArray) {
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
            else {
                return { passed: false, txt: String(bl) };
            }
        });
    }
    /**
     * 超时方法
     * @param fun
     * @param timeOut
     */
    overtimeFun(fun, timeOut) {
        return new Promise((resolve, reject) => {
            if (timeOut) {
                setTimeout(() => {
                    resolve('超时');
                }, timeOut);
            }
            let funResult, time = 0;
            util.performanceTest(() => {
                funResult = fun();
            }).then((value) => {
                time = value;
                if (time > timeOut) {
                    resolve('超时');
                }
                else {
                    if (funResult.then) {
                        funResult.then(value => resolve(value));
                    }
                    else {
                        resolve(funResult);
                    }
                }
            });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new Test();
