
module.exports = (event, models, { app }) => {
    console.log("Action is here", event.action);
    if (event.action === 'create' && event.collection === 'posts') {
      const newData = event.item;
  
      console.log('Data created:', newData);
  
    }
  };