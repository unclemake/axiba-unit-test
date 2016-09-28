
import * as test from '../src/index'

function testFunCase(value) {
    return value + 'a';
}

let testList1 = [];
testList1.push({
    title: '测试1',
    run: () => {
        let listClass = new test.TestCaseList((value) => {
            return testFunCase(value);
        });

        listClass.add(['3'], value => value === '3a');
        return listClass.run();
    }
});

let testModule1: test.TestModule = {
    title: 'TestCaseList测试模块',
    caseArray: testList1
};
test.default.push(testModule1);


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


let stringCase1: test.TestCase = {
    title: '返回字符串测试',
    run: () => {
        return '字符串了';
    }
};


let stringCase2: test.TestCase = {
    title: '返回字符串测试2',
    run: () => {
        return '';
    }
};

let testList = [testCase, testCase2, testCase3, timeOutCase1, timeOutCase2, errorCase1, stringCase1, stringCase2];

let testModule: test.TestModule = {
    title: 'test测试模块',
    caseArray: testList
};
test.default.push(testModule);




















test.default.run().then(() => test.default.creatDoc());

