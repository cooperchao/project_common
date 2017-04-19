module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "globals": {
    "$": true,
    "jQuery": true,
    "require": true,
    "define": true,
    "module": true,
    "console": true,
    "window": true
  },
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "script",
    "ecmaFeatures": {
      "jsx": true,
      "impliedStrict": true
    }
  },
  "plugins": [
    "react"
  ],
  //使用airbnb當主要規則
  "extends": "airbnb",
  "rules": {
    //縮排不可以用TAB跟空白混用
    "no-mixed-spaces-and-tabs": "error",

    //邏輯判斷一定要有{}
    "curly": ["error", "all"],

    //最多只能到四層 超過就應該另外再拉出來製作function
    "max-depth": ["error", 4],

    //object & array 最後一個元素 不可以有,結尾
    "comma-dangle": ["error", "never"],

    //如果function內的變數 沒有被使用到 可以接受 (Waterline 規則)
    "no-unused-vars": ["error", {
      "vars": "all",
      "args": "none"
    }],

    //因為有許多外部引入的未事先定義 所以將此處列為warning (Sails規則)
    "no-undef": 1
  }
}
