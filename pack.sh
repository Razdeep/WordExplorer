#!/bin/bash
echo "Removing WordExplorer.zip"
rm WordExplorer.zip
echo "Zipping files"
zip -r ./WordExplorer.zip ./*
echo "Successfully created WordExplorer.zip"