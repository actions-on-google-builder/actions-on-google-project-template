module.exports = app => {
  const demoEntity = app.getArgument("demo-entity");
  
  app.tell(app.__("HELLO_WORLD", {
    arg: demoEntity
  }));
};