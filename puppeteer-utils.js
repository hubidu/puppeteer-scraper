const getHref = async el => {
  const hrefHandle = await el.getProperty('href');
  return hrefHandle.jsonValue();
};

const getValue = async el => (await el.getProperty('innerHTML')).jsonValue();

module.exports = {
  getValue,
  getHref,
};
