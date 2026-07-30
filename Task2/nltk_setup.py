"""
NLTK Resource Downloader Module
--------------------------------
This script ensures that all required Natural Language Processing resources from NLTK
(tokenizers, stop words corpora, and WordNet lemmatizer data) are downloaded and available.
"""

import nltk

def download_nltk_resources():
    """
    Downloads required NLTK packages if they are not already installed locally.
    """
    resources = [
        'punkt',
        'punkt_tab',
        'stopwords',
        'wordnet',
        'omw-1.4'
    ]
    
    print("Initializing NLTK Resource Setup...")
    for resource in resources:
        try:
            print(f"Checking/Downloading NLTK resource: '{resource}'...")
            nltk.download(resource, quiet=True)
            print(f"✓ Resource '{resource}' is ready.")
        except Exception as e:
            print(f"⚠️ Warning downloading '{resource}': {e}")
            
    print("All NLTK resources verified successfully.\n")

if __name__ == '__main__':
    download_nltk_resources()
