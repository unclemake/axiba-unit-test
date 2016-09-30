declare module "axiba-unit-test" {

    /**
   * 单个测试
   */
    export interface TestM<Y> {
        argument: Y,
        comparisonFunction: (arg) => string | boolean | Promise<string> | Promise<boolean>
        overtime?: number
        pass?: boolean,
        error?: string
    }

    /**
     * 测试单元类
     */
    export class TestUnit<T, Y> {

        /**
         * 构造函数
         * @param name 单元名
         * @param testFunction 单元函数
         */
        constructor(name: string, testFunction: T)

        /** 测试单元名 */
        name: string

        /** 测试函数 */
        private testFunction: T

        /** 测试参数数组 */
        private testList: TestM<Y>[]

        /**
         * 添加测试
         * @param argument 参数
         * @param comparisonFunction 测试函数返回值 对比函数
         * @param overtime 超时时间
         */
        add(argument: Y, comparisonFunction: (arg) => string, overtime?: number): this

        /**
        * 运行 测试
        */
        run(): {
            all: number
            pass: number
            error: string
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
        add(testUnit: TestUnit<any, any>): void

        /**
       * 运行 测试
       */
        run(): {
            all: number
            pass: number
            error: string
        }
    }


    var exp: Test;
    /**
     * 对外接口
     */
    export class Test {

        /**
       * 添加测试模块
       * @param testModule 模块名称
       */
        add(testModule: TestModule): void

        /**
         * 运行所有测试用例
         */
        run(): Promise<any>

        /**
         * 生成文档
         * @param path
         */
        creatDoc(path?: string)

    }

    export default exp;

}