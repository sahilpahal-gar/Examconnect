const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateEligibility } = require('../server/services/eligibilityEngine');

const baseExam = { qualification:{minimumLevel:'graduate',degrees:[],streams:[]}, age:{minimum:18,maximum:32}, category:['UR','OBC','SC','ST','EWS'], gender:['male','female','other'], domicile:[], verificationStatus:'verified' };
const profile = { age:21, qualification:'graduate', degree:'B.Voc Software Development', stream:'Computer Science', category:'EWS', gender:'female', domicile:'Haryana' };

test('graduate is eligible for graduate exam', () => assert.equal(evaluateEligibility(profile, baseExam).eligible, true));
test('12th is rejected from graduate exam', () => assert.equal(evaluateEligibility({...profile, qualification:'12th'}, baseExam).eligible, false));
test('age below minimum is rejected', () => assert.equal(evaluateEligibility({...profile, age:17}, baseExam).eligible, false));
test('age above maximum is rejected', () => assert.equal(evaluateEligibility({...profile, age:33}, baseExam).eligible, false));
test('category mismatch is rejected', () => assert.equal(evaluateEligibility(profile, {...baseExam, category:['UR']}).eligible, false));
test('gender restriction is enforced', () => assert.equal(evaluateEligibility(profile, {...baseExam, gender:['male']}).eligible, false));
test('degree requirement is enforced', () => assert.equal(evaluateEligibility(profile, {...baseExam, qualification:{...baseExam.qualification,degrees:['B.Tech']}}).eligible, false));
test('stream requirement is enforced', () => assert.equal(evaluateEligibility(profile, {...baseExam, qualification:{...baseExam.qualification,streams:['Engineering']}}).eligible, false));
