
import * as test from '../src/index'

(async function () {
    let testUnit = new test.TestUnit<any, [number, number]>('单元测试,TestUnit');

    testUnit.add([1, 2], (arg) => arg === 3)
        .add([1, 2], (arg) => arg === 1)
        .add([1, 2], (arg) => false)
        .add([1, 2], (arg) => true)
        .add([1, 2], async (arg) => {
           return await new Promise(() => {

            });
        })
        .add([1, 2], async (arg) => {
            let pl = await (() => 1);
            throw '出错了';
        });
    let result = await testUnit.run();


    let log = `*****单元测试
all:${result.all}
pass:${result.pass}
error:
${result.error}
*****单元测试


`;
    console.log(log);



    let testUnit2 = new test.TestUnit<(a, b) => number, [number, number]>('单元测试2,TestUnit', (a, b) => a + b);
    testUnit2.add([1, 2], (arg) => arg === 3)
    result = await testUnit2.run();

    log = `*****单元测试2
all:${result.all}
pass:${result.pass}
error:
${result.error}
*****单元测试2


`;
    console.log(log);




    let testUnit3 = new test.TestUnit<any, any>('单元测试3')

    testUnit.add([1, 2], (arg) => arg === 1);

    let testUnit4 = new test.TestUnit<any, any>('单元测试4')
    testUnit4.add([1, 2], (arg) => arg === 1)
        .add([1, 2], async (arg) => {
            await new Promise(() => {
            });
        })
        .add([1, 2], (arg) => {
            throw '报错';
        });

    let testUnit5 = new test.TestUnit<(a, b) => number, any>('单元测试5', (a, b) => a * b)
    testUnit5.add([1, 2], (arg) => arg === 2)
        .add([3, 1], (arg) => arg === 3)
        .add([3, 1], (arg) => arg === 6)


    let testModule1 = new test.TestModule('模块1')

    testModule1.add(testUnit3);
    testModule1.add(testUnit4);
    testModule1.add(testUnit5);

    testModule1.run();



})()






//let test1Add = test.default.add('TestCaseList测试模块');
//function testFunCase(value) {
//    return value + 'a';
//}
//test1Add('测试', value => testFunCase(value))
//    .add(['3'], value => value === '3a');


//let test2Add = test.default.add('test测试模块');
//test2Add('测试1').add([], () => true);
//test2Add('测试2').add([], () => false);
//test2Add('超时测试1', () => new Promise(() => { }), 10).add([], () => true);
//test2Add('超时测试2', () => { }, 10).add([], () => {
//    let nu = 999;
//    for (let i = 0; i < 9999999; i++) {
//        nu = nu + 1;
//    }
//    return true
//});
//test2Add('异常测试1', () => { }).add([], () => { throw '异常了' });

//let testCase: test.TestCase = {
//    title: '测试1',
//    run: () => { return true; }
//};

//let testCase2: test.TestCase = {
//    title: '测试2',
//    run: () => { return true; }
//};


//let testCase3: test.TestCase = {
//    title: '测试3',
//    run: () => { return false; }
//};

//let timeOutCase1: test.TestCase = {
//    title: '超时测试1',
//    overtime: 10,
//    run: () => {
//        return new Promise(() => {

//        })
//    }
//};

//let timeOutCase2: test.TestCase = {
//    title: '测试5',
//    overtime: 1,
//    run: () => {

//        let nu = 999;
//        for (let i = 0; i < 9999999; i++) {
//            nu = nu + 1;
//        }

//        return true
//    }
//};

//let errorCase1: test.TestCase = {
//    title: '异常测试1',
//    run: () => {
//        throw '异常了';
//    }
//};


//let stringCase1: test.TestCase = {
//    title: '返回字符串测试',
//    run: () => {
//        return '字符串了';
//    }
//};


//let stringCase2: test.TestCase = {
//    title: '返回字符串测试2',
//    run: () => {
//        return '';
//    }
//};

//let testList = [testCase, testCase2, testCase3, timeOutCase1, timeOutCase2, errorCase1, stringCase1, stringCase2];

//let testModule = test.default.push('test测试模块');

//test.default.run().then(() => test.default.creatDoc());

