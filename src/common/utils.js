export const extractErrors = err => {
  return err.inner.reduce((acc, err) => {
    return { ...acc, [err.path.split('.')[0]]: err.message };
  }, {});
};

export const setCookie = (name, value, days) => {
  let expires = '';
  if (days) {
      let date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '')  + expires + '; path=/';
};

export const getCookie = name => {
  let nameEQ = name + '=';
  let ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
      let c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
};

export const eraseCookie = name => {   
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

/*
export const getCookie = name => {
  // eslint-disable-next-line no-useless-escape
  function escape(s) { return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, '\\$1'); }
  let match = document.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
  return match ? match[1] : null;
};
*/

export const getDataForAuth = () => {
  const userFromLocalStorage = process.browser ? JSON.parse(localStorage.getItem('user')) : null;

  const { accessToken, companyUuid } = userFromLocalStorage;

  return { accessToken, companyUuid };
};

/**
 * function to get something from the object path when the object is parsed.
 *
 * @param {object} [object={}]
 * @param {string} [path='']
 * @returns {any}
 */
export const getFromObjectPathParsed = (object = {}, path = '') => {
  const keysToEvaluete = path.split('.');

  let iteraingObject = object;
  for (const key of keysToEvaluete) {
    iteraingObject = iteraingObject[key];
    if (!iteraingObject) return;
  }
  return iteraingObject;
};
