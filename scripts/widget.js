const webpack = require('webpack');
const { merge } = require('webpack-merge');
const baseConfig = require('../config/webpack.widget.base');

const widget = process.argv[2];

console.log(`widget ${widget} 将被编译`);

const config = replaceEntry(
  merge(
    baseConfig,
    require(`../widgets/${widget}/webpack.prod`),
    {
      output: {
        chunkLoadingGlobal: `webpack${widget}Jsonp`, // 需要为每个 widget 指定不同的 webpackJsonp 名称，不然可能会导致 widget chunk 加载时的冲突
      }
    }
  ),
  widget,
);

console.log(`widget ${widget} 配置信息`, config);

const compiler = webpack(config);
compiler.run((err, stats) => {
  if (err) {
    console.warn('!!!!!! compile error !!!!!!');
    // console.error(err);
    return;
  }
  const { errors } = stats;
  if (errors) {
    console.info(`widget ${widget} 构建失败`);
    // console.errors(errors);
    return;
  }
  console.info(`widget ${widget} 构建完成`);
  // console.info(stats.chunks);

  compiler.close((closeErr) => {
    // ...
  });
})

function replaceEntry(config, widgetName) {
  const entryType = Object.prototype.toString.call(config.entry);
  switch (entryType) {
    case '[object String]':
      config.entry = {
        [widgetName]: config.entry
      };
      break;
    case '[object Object]':
      const entries = Object.entries(config.entry);
      if (entries.length > 0) {
        let [_, mainEntry] = entries[0]; // todo - 只获取第一个么？？？
        config.entry = {
          [widgetName]: mainEntry
        };
        // todo - 不应该支持多 entry ？？
        const len = entries.length;
        for (let i=1; i<len; i++) {
          [_, mainEntry] = entries[i];
          config.entry[`${widgetName}-${i}`] = mainEntry;
        }
      } else {
        console.warn('No correct entry in configuration of webpack!');
      }
      break;
    case '[object Function]':
    case '[object Undefined]':
    case '[object Null]':
    default:
      console.warn(`The entry of webpack config - ${JSON.stringify(config.entry)} may be wrong!`);
      break;
  }
  return config;
}
