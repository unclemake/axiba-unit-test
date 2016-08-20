
declare module "axiba-unit-test" {

    export interface TestResult {
        passed: boolean,
        txt?: string
    }


    export interface TestCase {
        //用例标题
        title: string,
        //超时时间
        overtime?: number
        //测试用例函数
        run: () => Promise<boolean> | boolean,

        //测试结果
        result?: TestResult
    }


    export interface TestModule {
        //用例标题
        title: string
        //用例数组
        caseArray: TestCase[]
    }


    var exp: TestInterface;


    export class TestInterface {

        //测试用例数组
        caseArray: TestModule[] = []

        /**
         * 添加测试用例
         * @param testModule
         */
        push(testModule: TestModule)

        /**
         * 运行所有测试用例
         */
        run(): void

        /**
         * 单个测试是否通过
         * @param testCase
         */
        test(testCase: TestCase): Promise<TestResult>

        /**
         * 超时方法
         * @param fun
         * @param timeOut
         */
        overtimeFun(fun: Function, timeOut: number): Promise<boolean | string>
        /**
         * 生成文档
         * @param path
         */
        creatDoc(path: string)

    }

    export let Test: {
        new (): TestInterface;
    }

    export default exp;

}