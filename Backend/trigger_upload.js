const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function main() {
  try {
    // 1. Log in
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@gmail.com',
      password: '12345678'
    });
    const token = loginRes.data.data.accessToken;
    console.log('Logged in successfully, token received.');

    // 2. Prepare mock file
    // Let's write a small dummy text file
    fs.writeFileSync('dummy.jpg', 'fake-image-data-for-testing');

    // 3. Upload file
    const form = new FormData();
    form.append('image', fs.createReadStream('dummy.jpg'));

    console.log('Sending upload request...');
    const uploadRes = await axios.post('http://localhost:5000/api/v1/upload/single', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('UPLOAD SUCCESS:', uploadRes.data);
  } catch (error) {
    console.log('UPLOAD FAILED!');
    if (error.response) {
      console.log('STATUS:', error.response.status);
      console.log('RESPONSE DATA:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('ERROR:', error.message);
    }
  } finally {
    if (fs.existsSync('dummy.jpg')) {
      fs.unlinkSync('dummy.jpg');
    }
  }
}

main();
