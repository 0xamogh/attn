import React from 'react';

interface BlogPostProps {
  params: {
    slug: string;
  };
}

const BlogPost: React.FC<BlogPostProps> = ({ params: { slug } }) => {
  return (
    
<div
  className="hero min-h-screen"
  style={{
    backgroundImage: "url(https://t4.ftcdn.net/jpg/01/25/93/71/240_F_125937187_K6ae4w2j2cTldlBikheFfwFhl4mkw4I6.jpg)",
  }}>
  <div className="hero-overlay bg-opacity-60"></div>
  <div className="hero-content text-neutral-content text-center">
    <div className="max-w-md">
    <img
      src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
      className="max-w-sm rounded-lg shadow-2xl" />
    <div>
      <h1 className="text-5xl font-bold">Alok Potadar</h1>
      <p className="py-6">
        Alok is working as a Data professional since past 3 years. Go ahead and click the button to 
        start getting to know him better!
      </p>
      <textarea className="textarea textarea-bordered" placeholder="Type your message here"></textarea>
      
      <button className="btn btn-primary">Get Started</button>
    </div>
    </div>
  </div>
</div>
  );
};

export default BlogPost;