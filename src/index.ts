/// <reference path="../node_modules/axiba-util/src/index.ts" />
import * as fs from 'fs';
import { Util } from 'axiba-util';
import * as readline from 'readline';
import * as chalk from 'chalk';
import { TestM } from 'axiba-unit-test';
export { TestM };

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
    async run() {
        let errorStr = '';

        for (let i in this.testList) {
            let value = this.testList[i];

            let noNumber = parseInt(i) + 1;
            try {
                let str = await this.testFun(...value.arg);
                value.run(str) || (errorStr += noNumber + ': ' + str + '\n\r');
            } catch (e) {
                errorStr += noNumber + ': ' + e + '\n\r';
            }
        }

        return errorStr;
    }
}




export class Test {

    //测试用例数组
    caseModuleArray: TestModule[] = []

    /**
     * 添加测试用例
     * @param testModule
     */
    add(title: string, caseArray: TestCase[] = []) {
        let testModule = this.caseModuleArray.find(value => value.title == title);

        if (testModule) {
            testModule.caseArray = testModule.caseArray.concat(caseArray);
        } else {
            testModule = {
                title: title, caseArray: caseArray
            };
            this.caseModuleArray.push(testModule);
        }

        return (title: string, testFunCase?: (...arg) => any, overtime?: number) => {
            let listClass = new TestCaseList((value) => {
                if (testFunCase) {
                    return testFunCase(value);
                } else {
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
    async run() {
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
     * 生成文档
     * @param path
     */
    creatDoc(path: string = './testdoc.txt') {
        util.createLogFile(path);
    }

}



/**
 * 测试单元类 T 测试方法体 Y 参数 Z 返回值
 */
export class TestUnit<T extends Function, Y extends Array<any>> {

    /**
     * 构造函数
     * @param name 单元名
     * @param testFunction 单元函数
     */
    constructor(name: string, testFunction: T = (arg => arg) as any) {
        this.name = name;
        this.testFunction = testFunction;
    }

    /** 测试单元名 */
    name: string

    /** 默认超时 */
    overtime = 3000;

    /** 测试函数 */
    private testFunction: T

    /** 测试参数数组 */
    private testList: TestM<Y>[] = []

    /**
     * 添加测试
     * @param argument 参数
     * @param comparisonFunction 测试函数返回值 比对函数
     * @param overtime 超时时间
     */
    add(argument: Y, comparisonFunction: (arg) => string | boolean | Promise<string> | Promise<boolean>, overtime: number = this.overtime) {

        this.testList.push({ argument, comparisonFunction, overtime });
        return this;
    }


    /**
     * 单个测试测试
     * @param testM
     */
    testOne(testM: TestM<Y>): Promise<string> {
        return new Promise(async (resolve, reject) => {
            let error = '';
            let {argument, comparisonFunction, overtime} = testM;
            try {
                //函数卡死的跳出
                let st;
                if (overtime) {
                    st = setTimeout(() => {
                        resolve('函数运行超时');
                    }, overtime);
                }

                let rValue;
                let time = await util.performanceTest(async () => {
                    rValue = await this.testFunction(...argument);
                    return;
                });

                if (time > overtime) {
                    resolve('函数运行超时');
                }
                clearTimeout(st);

                st = setTimeout(() => {
                    resolve('比对函数运行超时');
                }, this.overtime);

                let val;
                try {
                    val = await comparisonFunction(rValue);
                } catch (e) {
                    clearTimeout(st);
                    resolve(e);
                }
                clearTimeout(st);

                if (typeof val == 'boolean') {
                    error = val ? '' : '判断函数false,result:' + JSON.stringify(rValue);
                } else if (typeof val == 'string') {
                    error = val
                }
            } catch (e) {
                error = e;
            }

            resolve(error);
        });
    }

    /**
    * 运行 测试
    */
    async run(): Promise<{
        all: number
        pass: number
        error: string
    }> {
        let [pass, error] = [0, ''];
        for (let i in this.testList) {
            let str = await this.testOne(this.testList[i]);

            if (str) {
                error += (parseInt(i) + 1) + ': ' + str + '\r\n';
            } else {
                pass++;
            }
        }

        return {
            all: this.testList.length,
            pass,
            error
        }
    }
}



/**
* 测试模块
*/
export class TestModule {

    /** 测试模块名 */
    name: string

    /** 测试参数数组 */
    testUnitArray: TestUnit<any, any>[]

    /**
     * 添加测试单元
     * @param testUnit
     */
    add(testUnit: TestUnit<any, any>) {
        this.testUnitArray.push(testUnit);
    }

    /**
   * 运行 测试
   */
    async run(): {
        all: number
        pass: number
        error: string
    } {
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
            let obj = await value.run();

            if (obj.all == obj.pass) {
                pass++;
            } else {
                error++;
            }

            let tpl = `全部:${all}  通过:${pass} 未通过:${error}  剩余:${all - pass - error}
                       正在运行：${value.name}`;

            rl.write(tpl);

        }

        rl.close();

        util.log('模块' + this.name + '测试完毕');

        return {

        }
    }
}



export default new Test();

