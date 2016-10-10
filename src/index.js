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
const chalk = require('chalk');
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
                    error = val ? '' : '判断函数出错,返回值:' + JSON.stringify(rValue);
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
  * @param testFun 测试方法
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
            let error = chalk.red(`\n----错误----\n`);
            util.log('运行模块：' + chalk.green(this.name) + chalk.yellow(' ---->\n'));
            for (let i in this.testUnitArray) {
                all++;
                let value = this.testUnitArray[i];
                util.write(`${chalk.gray('？')} ${value.name}`);
                let obj = yield value.run();
                resultArray.push(obj);
                if (obj.all == obj.pass) {
                    util.write(`${chalk.green('√')} ${value.name}\n`);
                    pass++;
                }
                else {
                    util.write(`${chalk.red('×')} ${value.name}\n`);
                    fail++;
                    error += chalk.yellow(value.name + '\n');
                    error += obj.error;
                }
            }
            let log = `\n全部:${all}  通过:${chalk.green(pass.toString())} 未通过: ${chalk.red(fail.toString())}`;
            util.log(log);
            if (all - pass !== 0) {
                error += chalk.red(`----错误----\n`);
                util.log(error);
            }
            util.log(`${chalk.yellow('<----')} 模块：${chalk.green(this.name)} 测试完毕`);
            return {
                all: all, pass: pass, error: error, resultArray: resultArray
            };
        });
    }
}
exports.TestModule = TestModule;
