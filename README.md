<h1 align='center'>Gyroscopic Background Images</h1>
<p align='center'> <img src='http://gyroscopic-backgrounds.com/wp-content/uploads/2019/03/gyroBackground-400-1-e1551743354216.png'/> </p>

<p align='center'>
This is a javascript library that uses the WebVR API to create web backgrounds that move with your phone. I have a vision for it to be the next "parallax" of the web. Feel free to contribute!
</p>

<p align='center'>
  <img src='https://img.shields.io/github/license/Tino-F/gyroBackground.svg' alt='license'/>
  <img src='https://img.shields.io/npm/v/gyrobackground.svg' alt='version'/>
</p>

<p align='center'><span style='color:red'>Only supported on WebVR compatible devices.</span></p>

## Installation

#### npm

```
npm install --save gyrobackground
# Or yarn add gyrobackground
```

#### builds

```js
<script src="https://unpkg.com/gyrobackground@0.5.0/dist/gyroBackground.min.js"></script>
```
<br/>

```js
require('gyrobackground')  // e.g., with Browserify or Webpack.
```

## Local Development

```sh
git clone https://github.com/Tino-F/gyroBackground.git  # Clone the repository.
cd gyroBackground && npm install  # Install dependencies.
npm start  # Start the local development server.
```

#### Generating builds
`>npm run build`

## Usage

```
//new GyroBackground( containerEl, imageURL, options )

var background = new GyroBackground('#myImage', 'imgs/4.jpg', {
  sensitivity: 3,
  parallax: true,
  parallaxSpeed: -4
});
```

## Options

|    Option   |  Type  | Default Value | Description |
|      --     |   --   |      --       |      --     |
| parallax | Boolean | false | Enable parallax on devices that don't have WebVR support. |
| parallaxSpeed | Float | -2 | How slow/fast the image moves while scrolling |
| sensitivity | Float | 0.5 | The "image's" responsiveness to movement. |
| landscapeSensitivity | Float | sensitivity | The "image's" responsiveness to movement when the device is in landscape mode. |
| portraitSensitivity | Float | sensitivity | The "image's" responsiveness to movement when the device is in portrait mode. |
| zoom | int | 0 | This value is added to the camera's z-distance from the image. |
| landscapeZoom | int | 0 | This value is added to the camera's z-distance when the device is in landscape mode. |
| portraitZoom | int | 0 | This value is added to the camera's z-distance when the device is in portrait mode. |
| offsetX | int | 0 | The image's offset from the auto-calculated X position. |
| portraitOffsetX | int | offsetX | The image's offset from the auto-calculated X position when the device is in portrait mode. |
| landscapeOffsetX | int | offsetX | The image's offset from the auto-calculated X position when the device is in landscape mode. |
| offsetY | int | 0 | The image's offset from the auto-calculated Y position. |
| portraitOffsetY | int | offsetY | The image's offset from the auto-calculated Y position when the device is in portrait mode. |
| landscapeOffsetY | int | offsetY | The image's offset from the auto-calculated Y position when the device is in landscape mode. |
| inverted | Boolean | false | Reverse movement on the X & Y axis. |
| visualize | Boolean | false | Show a 3D representation of the phone's original position vs current. |
