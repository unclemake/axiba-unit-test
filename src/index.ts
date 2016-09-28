/// <reference path="../node_modules/axiba-util/src/index.ts" />
import * as fs from 'fs';
import { Util } from 'axiba-util';
import * as readline from 'readline';
import * as chalk from 'chalk';
import { TestModule, TestCase, TestResult, TestInterface } from 'axiba-unit-test';
export { TestModule, TestCase, TestResult, TestInterface };

let util = new Util();


export class TestCaseList {

    /** 测试方法*/
    private testFun: (...arg) => any

    /** 测试列表*/
    private testList: {
        arg: any[], run: (value) => boolean
    }[] = []
    /**
     * 构造函数
     * @param testFun 测试方法
     */
    constructor(testFun: (...arg) => any) {
        this.testFun = testFun;
    }

    /**
     * 添加测试数据
     * @param arg 测试数据
     * @param run 测试方法
     */
    add(arg: any[], run: (value) => boolean) {
        this.testList.push({
            arg: arg, run: run
        });
    }

    /**
     *  运行测试
     */
    run() {
        let errorStr = '';

        for (let i in this.testList) {
            let value = this.testList[i];
            try {
                let str = this.testFun(...value.arg);
                value.run(str) || (errorStr += i + ': ' + str + '\n\r');
            } catch (e) {
                errorStr += i + ': ' + e + '\n\r';
            }
        }

        return errorStr;
    }
}


export class Test implements TestInterface {

    //测试用例数组
    caseArray: TestModule[] = []

    /**
     * 添加测试用例
     * @param testModule
     */
    push(testModule: TestModule) {
        let testModuleGet = this.caseArray.find(value => value.title == testModule.title);

        if (testModuleGet) {
            testModuleGet.caseArray = testModuleGet.caseArray.concat(testModule.caseArray);
        } else {
            this.caseArray.push(testModule);
        }
    }

    /**
     * 运行所有测试用例
     */
    async run() {
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
                    let result = await this.test(testCase);
                    testCase.result = result;
                    result.passed ? passNu++ : failNu++;

                    rl.write(null, { ctrl: true, name: 'u' });


                    let logStr = '总数:' + value.caseArray.length + ' 通过:' + passNu.toString() + " 未通过:" + failNu.toString() + '';
                    if (parseInt(i) === value.caseArray.length - 1) {
                        util.log(logStr);
                    } else {
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
                        util.log(testCase.result.txt)
                        util.log('');
                    }
                }

            }

        } catch (e) {
            console.log(e);
        }

    }



    /**
     * 单个测试是否通过
     * @param testCase
     */
    async test(testCase: TestCase): Promise<TestResult> {
        let bl = await this.overtimeFun(() => {
            try {
                return testCase.run();
            } catch (e) {
                return e;
            }
        }, testCase.overtime);

        if (typeof bl == 'boolean') {
            if (bl) {
                return { passed: true, txt: '成功' }
            } else {
                return { passed: false, txt: '失败' }
            }
        } else if (typeof bl == 'string') {
            if (bl === '') {
                return { passed: true, txt: '成功' }
            } else {
                return { passed: false, txt: String(bl) }
            }
        } else {
            return { passed: false, txt: String(bl) }
        }

    }

    /**
     * 超时方法
     * @param fun
     * @param timeOut
     */
    overtimeFun(fun: Function, timeOut: number): Promise<boolean | string> {
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
                } else {
                    if (funResult.then) {
                        funResult.then(value => resolve(value))
                    } else {
                        resolve(funResult);
                    }
                }
            })

        });
    }

    /**
     * 生成文档
     * @param path
     */
    creatDoc(path: string = './testdoc.txt') {
        util.createLogFile(path);
    }

}

export default new Test();

