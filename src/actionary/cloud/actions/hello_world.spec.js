const helloWorld = require('./hello_world');
const Actionary = require('../../../services/actionary');

describe('test Hello World', () => {

  it('should call app.tell()', () => {
    const tell = spyOn(Actionary.ActionaryMock, 'tell');
    helloWorld(Actionary.ActionaryMock);
    expect(tell).toHaveBeenCalled();
  });

  it('should call app.__()"', () => {
    const __ = spyOn(Actionary.ActionaryMock, '__');
    helloWorld(Actionary.ActionaryMock);
    expect(__).toHaveBeenCalledWith("HELLO_WORLD", {arg: "demo-entity"});
  });

  it('should call app.getArgument()', () => {
    const getArgument = spyOn(Actionary.ActionaryMock, 'getArgument');
    helloWorld(Actionary.ActionaryMock);
    expect(getArgument).toHaveBeenCalled();
  });

})