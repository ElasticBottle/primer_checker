#! /usr/bin/perl -w

# script written by Sebastian Maurer-Stroh, BII A*STAR (Jan-Apr 2020)

use strict;
use warnings;


my $blastdir = "/HOME_ann/BII/biipsashare/winston/primer_mutation/ncbi-2.10.1/bin/";
my $blastDBFolder = "/HOME_ann/BII/biipsashare/winston/primer_mutation/blastDB/";
my $blastdb = "/HOME_ann/BII/biipsashare/winston/primer_mutation/blastDB/target";

my $referenceFile = "/HOME_ann/BII/biipsashare/winston/primer_mutation/blastDB/gisaid_cov2020_sequences_aligned_processed.fasta";
my $targs = readFasta($referenceFile,0);
printFastaFile("$referenceFile.clean", $targs);

system "${blastdir}makeblastdb -in ${blastDBFolder}$referenceFile.clean -dbtype nucl -out ${blastdb} -logfile tmp_blastdb.log";

sub readFasta {
  my ($myfile,$mydesc) = @_;
  # $mydesc:
  # 0 ... whole ">" description line becomes identifier
  # 1 ... everything after ">" up to the first space+ becomes identifier /^>([^\r\n\s\t]+)/
  # 2 ... >xxx|zzzzzzz|xx  "zzzzzzz" becomes identifier /^>[^\|]+\|([^\|]+)\|/
  my $myid;
  my %myseqs;
  my $multi = 0;
  open (FILE, "$myfile") || die ("ERROR: readFasta() could not open file $myfile !!!\n");
  while (defined(my $line = <FILE>)) {
    $line =~ s/\r//g;
    if ($mydesc == 0 && $line =~ /^>/) {
      $myid = $line;
      $myid =~ s/[>\n]+//g;
      $myid =~ s/\s+/_/g;
      if (exists($myseqs{$myid})) {
        $multi++;
        $myid =~ s/\n/_$multi\n/;
        #~ $myid = $myid . "_$multi";
        }
      $myseqs{$myid} = "";
      }
    if ($mydesc == 1 && $line =~ /^>([^\r\n\s\t]+)/) {
      $myid = $1;
      if (exists($myseqs{$myid})) {
        $multi++;
        $myid = $myid . "_$multi";
        }
      $myseqs{$myid} = "";
      }
    if ($mydesc == 2 && $line =~ /^>[^\|]+\|([^\|]+)\|/) {
      $myid = $1;
      if (exists($myseqs{$myid})) {
        $multi++;
        $myid = $myid . "_$multi";
        }
      $myseqs{$myid} = "";
      }
    if ($mydesc == 2 && $line =~ /^>/ && $line !~ /^>[^\|]+\|([^\|]+)\|/) {
      die ("ERROR: readFasta() identifier parsing option (/^>[^\|]+\|([^\|]+)\|/) not suitable with description lines in $myfile!!!\n");
      }
    if ($line !~ /^>/) {
      $line =~ s/[^A-Za-z]//g;
      $line = uc($line);
      $myseqs{$myid} = $myseqs{$myid}.$line;
      }
    } 
  close (FILE);
  return(%myseqs);
  }


sub printFastaFile {
  my ($myfile,%myseqs) = @_;
  open (FILE, ">$myfile") || die ("ERROR: printFastaFile() could not open file $myfile to write!!!\n");
  foreach my $id (keys %myseqs)  {
    print FILE ">$id\n$myseqs{$id}\n";
    }
  close(FILE);
  }