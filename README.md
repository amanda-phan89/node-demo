# Prepare environment
- Run the following command line
```
git clone https://github.com/amanda-phan89/node-demo.git
npm install
cp .env.example .env
```
- Then update configuration value in .env file
- Create table with the structure
```
CREATE TABLE `images` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(256) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
# Running
- For demo promise: 
```
node indexPromise
```
- For async/await:
```
node indexAwait
```
