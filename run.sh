#!/bin/bash
cd /root/bots/FurryBot

while true;
do
	/root/.nvm/versions/node/v11.15.0/bin/ts-node-dev . -r tsconfig-paths/register --expose-gc
done