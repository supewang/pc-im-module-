// base validate
export const validate = (validateItem, inputItem) => {
  let tmp = null;
  try {
    if (validateItem.validate) {
      //validate true
      if (validateItem.value == null || validateItem.value == undefined) {
        // menber key value is null
        if (inputItem == null || inputItem == undefined) {
          // input value is null
          throw new Error(`input value is null `);
        } else {
          // input value is not null
          tmp = validateItem.type(inputItem);
        }
      } else {
        // menber key value is not null
        if (inputItem || inputItem == 0) {
          tmp = inputItem;
        } else {
          tmp = validateItem.value;
        }
      }
    } else {
      //validate false
      inputItem && (tmp = inputItem);
    }
  } catch (e) {
    console.error("current validateItem: [" + validateItem + "] inputItem:[" + inputItem + "] : error=>" + e);
    tmp = null;
  }
  return tmp;
};
// 嵌套
export const validates = (validateItem, inputItem) => {
  let tmp = {};
  try {
    Object.keys(validateItem).forEach((key) => {
      let tmpVal = validate(validateItem[key], inputItem[key]);
      tmpVal != null && (tmp[key] = tmpVal);
    });
  } catch (e) {
    console.error(e);
    tmp = null;
  }
  return tmp;
};
