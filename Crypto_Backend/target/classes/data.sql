INSERT INTO exchanges (name, base_url) VALUES ('Binance', 'https://api.binance.com') ON DUPLICATE KEY UPDATE base_url=base_url;
INSERT INTO exchanges (name, base_url) VALUES ('Coinbase', 'https://api.coinbase.com') ON DUPLICATE KEY UPDATE base_url=base_url;
INSERT INTO exchanges (name, base_url) VALUES ('Kraken', 'https://api.kraken.com') ON DUPLICATE KEY UPDATE base_url=base_url;
