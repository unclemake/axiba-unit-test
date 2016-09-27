
import * as test from '../src/index'


let testCase: test.TestCase = {
    title: '测试1',
    run: () => { return true; }
};

let testCase2: test.TestCase = {
    title: '测试2',
    run: () => { return true; }
};


let testCase3: test.TestCase = {
    title: '测试3',
    run: () => { return false; }
};

let timeOutCase1: test.TestCase = {
    title: '超时测试1',
    overtime: 10,
    run: () => {
        return new Promise(() => {

        })
    }
};

let timeOutCase2: test.TestCase = {
    title: '测试5',
    overtime: 1,
    run: () => {

        let nu = 999;
        for (let i = 0; i < 9999999; i++) {
            nu = nu + 1;
        }

        return true
    }
};

let errorCase1: test.TestCase = {
    title: '异常测试1',
    run: () => {
        throw '异常了';
    }
};




let testModule: test.TestModule = {
    title: '测试模块1',
    caseArray: [testCase, testCase2, testCase3, timeOutCase1, timeOutCase2, errorCase1]
};


test.default.push(testModule);
test.default.run().then(() => test.default.creatDoc());

