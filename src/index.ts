import * as fs from 'fs';
import { Util } from 'axiba-util';
import * as readline from 'readline';
import * as chalk from 'chalk';

let util = new Util();



export class TestCaseList {

    /** 测试方法*/
    private testFunction: (...arg) => any

    /** 测试列表*/
    private testList: {
        arg: any[], run: (value) => boolean
    }[] = []
    /**
     * 构造函数
     * @param testFunction 测试方法
     */
    constructor(testFunction: (...arg) => any) {
        this.testFunction = testFunction;
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
                let str = await this.testFunction(...value.arg);
                value.run(str) || (errorStr += noNumber + ': ' + str + '\n\r');
            } catch (e) {
                errorStr += noNumber + ': ' + e + '\n\r';
            }
        }

        return errorStr;
    }
}



/**
* 单个测试
*/
export interface TestM<Y> {
    argument: Y,
    comparisonFunction: ComparisonFunction
    overtime?: number
    pass?: boolean,
    error?: string
}




export interface ComparisonFunction {
    (arg): string | boolean | Promise<string> | Promise<boolean> | Promise<void> | void
}

/**
 * 测试单元类 T 测试方法体 Y 参数 Z 返回值
 */
export class TestUnit<T extends Function, Y extends Array<any>> {

    /**
     * 构造函数
     * @param name 单元名
     * @param testFunctionction 单元函数
     */
    constructor(name: string, testFunctionction: T = (arg => arg) as any) {
        this.name = name;
        this.testFunctionction = testFunctionction;
    }

    /** 测试单元名 */
    name: string

    /** 默认超时 */
    overtime = 3000;

    /** 测试函数 */
    private testFunctionction: T

    /** 测试参数数组 */
    private testList: TestM<Y>[] = []

    /**
     * 添加测试
     * @param argument 参数
     * @param comparisonFunction 测试函数返回值 比对函数
     * @param overtime 超时时间
     */
    add(argument: Y, comparisonFunction: ComparisonFunction, overtime: number = this.overtime) {

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
                    rValue = await this.testFunctionction(...argument);
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
                    error = val ? '' : '判断错误,返回值:' + JSON.stringify(rValue);
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


    /**
  * 构造函数
  * @param testFunction 测试方法
  */
    constructor(name: string) {
        this.name = name;
    }


    /** 测试参数数组 */
    testUnitArray: TestUnit<any, any>[] = []

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
    async run(): Promise<{
        all: number
        pass: number
        error: string
        resultArray: {
            all: number
            pass: number
            error: string
        }[]
    }> {
        let [all, pass, fail, resultArray] = [0, 0, 0, []];
        let error = chalk.red(`\n----错误----\n`);
        util.log('运行模块：' + chalk.green(this.name) + chalk.yellow(' \n'));

        for (let i in this.testUnitArray) {
            all++;
            let value = this.testUnitArray[i];

            util.write(`${chalk.gray('？')} ${value.name}`);

            let obj = await value.run();
            resultArray.push(obj);

            if (obj.all == obj.pass) {
                util.write(`${chalk.green('√')} ${value.name}\n`);
                pass++;
            } else {
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
        util.log(`${chalk.yellow('______________________________ ')} \n`);

        return {
            all, pass, error, resultArray
        }
    }
}


/** 无泛型单元测试 */
class TestUnitEasy extends TestUnit<any, any>{ }


/** 记录单元测试模块 */
let testModule: TestModule;
/** 记录单元测试模块组 */
let testModuleList: TestModule[] = [];
/** 创建单元测试模块 */
export async function describe(name: string, cb: Function) {
    testModule = new TestModule(name);
    cb();
    testModuleList.push(testModule);
}

/** 创建单元测试 */
export function it(name: string, cb: Function) {
    testModule.add(new TestUnitEasy(name).add([0], (arg) => cb()));
    cb();
}

/** 创建多参数单元测试 */
export function its(name: string, testFunction: Function, cb: () => void) {
    let testUnit = new TestUnitEasy(name, testFunction);
    testModule.add(testUnit);
    itAdd = testUnit.add.bind(testUnit);
    cb();
}

/** 运行测试用例  */
export async function run() {
    for (let key in testModuleList) {
        let element = testModuleList[key];
        await element.run();
    }

    util.createLogFile();
}


let testObj;
export async function describeClass(name: string, testObjNow: any, cb: Function) {
    testModule = new TestModule(name);
    testObj = testObjNow;
    cb();
    testModuleList.push(testModule);
}


/** 创建多参数单元测试 */
export function itClass(name: string, cb: () => void) {

    if (!testObj[name]) {
        util.warn(`${name} key不存在`);
        return;
    }

    let testUnit = new TestUnitEasy(name, testObj[name].bind(testObj));
    testModule.add(testUnit);
    itAdd = testUnit.add.bind(testUnit);
    cb();
}


/** 添加多参数 */
export let itAdd: (argument: any[], comparisonFunction: ComparisonFunction, overtime: number) => void;


