const { default: daisyui } = require('daisyui');

module.exports = {
        content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
        plugins: [
        require('daisyui'),
      ],
      theme: {
        extend: {
          colors: {
            'cream' : '#fff6ea'
          }
        }
      }  
  };