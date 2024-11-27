const images = [
    'https://storage.googleapis.com/only_plans_images_bucket_28294075-1f2d-4568-9c93-66035260a389/1080x566.jpg',
    'https://storage.googleapis.com/only_plans_images_bucket_28294075-1f2d-4568-9c93-66035260a389/1080x1350.jpg',
    'https://storage.googleapis.com/only_plans_images_bucket_28294075-1f2d-4568-9c93-66035260a389/1080x1080.jpg',
    'https://storage.googleapis.com/only_plans_images_bucket_28294075-1f2d-4568-9c93-66035260a389/14-days-clean-eating-meal-plan-1200-lede-601736337d914519bb5bf8eb83540da1.jpg'
];
module.exports=
{
    images,
    getRandomImage: () => images[Math.floor(Math.random() * images.length)]
}