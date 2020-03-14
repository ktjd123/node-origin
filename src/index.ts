import axios from 'axios';

const add = (a: number, b: number) => a + b;

axios.get('https://www.naver.com');

console.log(add(3, 5));
