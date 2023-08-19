const axios = require('axios');

const askWearther = async (address) => {
  const options = {
    method: 'GET',
    url: 'https://open-weather13.p.rapidapi.com/city/' + address,
    headers: {
      'X-RapidAPI-Key': '235095ed3dmshac02d9de1df7061p13a6a3jsn70a1ec217fef',
      'X-RapidAPI-Host': 'open-weather13.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    console.log(response.data.weather[0].description);

    return response.data.weather[0].description.toString();
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  askWearther
};
