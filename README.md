# Wormicloud

Visual tool based on word clouds to explore the *C. elegans* literature

## Frontend

React app with four main components:
 
- Search interface that queries the *C. elegans* literature through Textpresso Central
- Word Cloud generator based on text from abstracts of articles matching queries
- Word Trend tool to track the use of key words in the literature over time for matching articles
- List of references matching queries

## Backend

Python API that interfaces with Textpresso Central and processes retrieved articles with text mining functions and 
generates word counters
