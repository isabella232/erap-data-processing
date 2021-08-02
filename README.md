# ERAP Data Processing

**Description**: This project processes data about Emergency Rental Assistance Programs (ERAP) into a JSON file intended to be digested by our ERAP Lookup Tool. 	

## Dependencies

This script uses node (v14).

## Installation

Cloning this repo is all that's required to run it locally.

## Usage

`node erap-data-processing.js <filename>`

The script will output the JSON to `./output/erap.json`.

`node erap-data-processing.js <filename> > file.json`

The script looks for a specific format of TSV file. A sample of such a file can be found in `./sample_files/`

To test run the script with the sample file, try:

`node erap-data-processing.js sample_files/sample-raf.tsv`

----

## Open source licensing info
1. [TERMS](TERMS.md)
2. [LICENSE](LICENSE)
3. [CFPB Source Code Policy](https://github.com/cfpb/source-code-policy/)

