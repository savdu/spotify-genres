import csv

with open('data/lean1.csv', 'rb') as csv_file:
   reader = csv.reader(csv_file) 
   for row in reader:
      genre_count[row[0]][row[1]] += 1