#! /usr/bin/perl -w

# script written by Sebastian Maurer-Stroh, BII A*STAR (Jan-Apr 2020)

use strict;

my ($primerfile) = @ARGV; # $primerfile [with 3 primer sequences using headers >fwd >prb >rev IN ORIENTATION OF THE REFRENCE GENOME] $targetfile [complete human host high quality genomes from GISAID]

my %primerlist = ("$primerfile",0);
# my %primerlist = ("Charite-E",0,"Charite-RdRP",1,"US-CDC-N1",2,"US-CDC-N2",3,"US-CDC-N3",4,"China-CDC-ORF1ab",5,"China-CDC-N",6,"HKU-N",7,"HKU-ORF1b",8,"BGI-Orf1ab",9,"astar113",10,"astar118",11,"astar92",12,"astar115",13,"NPHL-N",14,"NPHL-O",15,"NPHL-S",16,"CGH-N",17);

my $bastDBFolder = "/home/yeokhw/blastDB/"
my $blastdb = "/home/yeokhw/blastDB/target";
my $blastdir = "/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona/gamma/blast-2.2.23/bin/";

my $wordsize = 7;
my $evalue = 700000;
my $maxseqs = 1000000;

my $distfilter = 1; # distance filter turned on (1) or off (0)
my $maxdist = 500;  # maximum distance f-p and p-r

foreach my $primerfile (sort {$primerlist{$a} <=> $primerlist{$b}} keys %primerlist) {
  # print "Taxon ID,Accession,%Homology FWD,%Homology REV,%Homology PRB,Species,Subject Title\n";
  my $blasttmpfile = "${primerfile}_tmp_blastn_w${wordsize}e${evalue}.csv";
  # my $blastoutfile = "${primerfile}_blastn_w${wordsize}e${evalue}.csv";
  my $blastoutfile = "${primerfile}_sensitivity.csv";
  system "${blastdir}blastn -query $primerfile -word_size $wordsize -db ${blastdb} -evalue $evalue -max_target_seqs $maxseqs -ungapped -outfmt \"10 qaccver saccver qlen nident length qstart qseq qend sstart sseq send pident mismatch gaps evalue bitscore ssciname stitle\" -penalty -1 -reward 2 -num_threads 5 -out $blasttmpfile"; # -negative_taxidlist neg_taxid.txids 
  open (BLASTOUT, ">$blastoutfile") || die ("Could not open file $blastoutfile !!!\n");
  print BLASTOUT "qaccver,saccver,qlen,nident,length,qstart,qseq,qend,sstart,sseq,send,pident,mismatch,gaps,evalue,bitscore,ssciname,stitle\n";
  close(BLASTOUT);
  system "cat $blasttmpfile >> $blastoutfile";
  system "rm $blasttmpfile";
  my ($miss,$miss3,$miss32,$hits) = primerBLASTcheck($primerfile,$blastoutfile, $distfilter, $maxdist, %targs);
  printf "$primerfile\t%.2f\t%.2f\t%.2f\t%d\n",$miss,$miss3,$miss32,$hits;
  }

# subs

sub primerBLASTcheck {
  my ($myprimerfile,$myfile, $mydistfilter, $mymaxdist, %mytargs) = @_;
  my %myf = ();
  my %myp = ();
  my %myr = ();
  my %myfs = ();
  my %myfqa = ();
  my %myfseqq = ();
  my %myfqb = ();
  my %myfsa = ();
  my %myfseqs = ();
  my %myfsb = ();
  my %myfm = ();
  my %myfm3 = ();
  my %myps = ();
  my %mypqa = ();
  my %mypseqq = ();
  my %mypqb = ();
  my %mypsa = ();
  my %mypseqs = ();
  my %mypsb = ();
  my %mypm = ();
  my %mypm3 = ();
  my %myrs = ();
  my %myrqa = ();
  my %myrseqq = ();
  my %myrqb = ();
  my %myrsa = ();
  my %myrseqs = ();
  my %myrsb = ();
  my %myrm = ();
  my %myrm3 = ();
  my %myt = ();
  my $myo = 0;
  my %myepi = ();
  my %myfha = ();
  my %myfhb = ();
  my %myfhs =();
  my %myfms = ();
  my %mypha = ();
  my %myphb = ();
  my %myphs =();
  my %mypms = ();
  my %myrha = ();
  my %myrhb = ();
  my %myrhs =();
  my %myrms = ();
  my %myprims = readFasta("$myprimerfile",0);
  open (FILE, "$myfile") || die ("Could not open file $myfile !!!\n");
  while (defined(my $line = <FILE>)) {
    if ($line =~ /^>/) {
      $line = s/ /_/g;
      }
    if ($line =~ /^fwd,([^,]+),([^,]+),([^,]+),[^,]+,([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,([^\r\n]+)/) {
      my $tperc = $3/$2*100;
      if (!exists($myf{$1}) || exists($myf{$1}) && $myf{$1}<$tperc) {
        my $mi = $1;
        $myfqa{$mi} = $4;
        $myfseqq{$mi} = $5;
        $myfqb{$mi} = $6;
        $myfsa{$mi} = $7;
        $myfseqs{$mi} = $8;
        $myfsb{$mi} = $9;
        if ($mi =~ /EPI_ISL_(\d+)/) {
          $myepi{$mi} = $1;
          }
        $myfha{$mi} = ($myfsa{$mi}-$myfqa{$mi}+1);
        $myfhb{$mi} = $myfha{$mi}+length($myprims{'fwd'})-1;
        if ($myfha{$mi} < 1 || $myfhb{$mi} > length($mytargs{$mi})) {
          next;
          }
        $myfhs{$mi} = substr($mytargs{$mi},($myfha{$mi}-1),length($myprims{'fwd'}));
        ($myfm{$mi},$myfms{$mi}) = mismatchStringsIDnuc($myprims{'fwd'},$myfhs{$mi});
        $myfm3{$mi} = mismatchStringsIDnuc3prime($myprims{'fwd'},$myfhs{$mi});
        $myf{$mi}=100-($myfm{$mi}*100/length($myprims{'fwd'}));
        $line =~ s/[\r\n]+//g;
        $myfs{$mi} = $line;
        }
      }
    if ($line =~ /^prb,([^,]+),([^,]+),([^,]+),[^,]+,([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,([^\r\n]+)/) {
      my $tperc = $3/$2*100;
      if (!exists($myp{$1}) || exists($myp{$1}) && $myp{$1}<$tperc) {
        my $mi = $1;
        $mypqa{$mi} = $4;
        $mypseqq{$mi} = $5;
        $mypqb{$mi} = $6;
        $mypsa{$mi} = $7;
        $mypseqs{$mi} = $8;
        $mypsb{$mi} = $9;
        $mypha{$mi} = ($mypsa{$mi}-$mypqa{$mi}+1);
        $myphb{$mi} = $mypha{$mi}+length($myprims{'prb'})-1;
        if ($mypha{$mi} < 1 || $myphb{$mi} > length($mytargs{$mi})) {
          next;
          }
        $myphs{$mi} = substr($mytargs{$mi},($mypha{$mi}-1),length($myprims{'prb'}));
        ($mypm{$mi},$mypms{$mi}) = mismatchStringsIDnuc($myprims{'prb'},$myphs{$mi});
        $mypm3{$mi} = mismatchStringsIDnuc3prime($myprims{'prb'},$myphs{$mi});
        $myp{$mi}=100-($mypm{$mi}*100/length($myprims{'prb'}));
        $line =~ s/[\r\n]+//g;
        $myps{$mi} = $line;
        }
      }
    if ($line =~ /^rev,([^,]+),([^,]+),([^,]+),[^,]+,([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,([^\r\n]+)/) {
      my $tperc = $3/$2*100;
      if (!exists($myr{$1}) || exists($myr{$1}) && $myr{$1}<$tperc) {
        my $mi = $1;
        $myrqa{$mi} = $4;
        $myrseqq{$mi} = $5;
        $myrqb{$mi} = $6;
        $myrsa{$mi} = $7;
        $myrseqs{$mi} = $8;
        $myrsb{$mi} = $9;
        $myrha{$mi} = ($myrsa{$mi}-$myrqa{$mi}+1);
        $myrhb{$mi} = $myrha{$mi}+length($myprims{'rev'})-1;
        if ($myrha{$mi} < 1 || $myrhb{$mi} > length($mytargs{$mi})) {
          next;
          }
        $myrhs{$mi} = substr($mytargs{$mi},($myrha{$mi}-1),length($myprims{'rev'}));
        ($myrm{$mi},$myrms{$mi}) = mismatchStringsIDnuc($myprims{'rev'},$myrhs{$mi});
        $myrm3{$mi} = mismatchStringsIDnuc3prime($myprims{'rev'},$myrhs{$mi});
        $myr{$mi}=100-($myrm{$mi}*100/length($myprims{'rev'}));
        $line =~ s/[\r\n]+//g;
        $myrs{$mi} = $line;
        }
      }
    }
  foreach my $myacc (keys %myf) {
    if (exists($myp{$myacc}) && exists($myr{$myacc})) {
      if ($mydistfilter == 0 || ($mydistfilter == 1 && abs($myfsa{$myacc}-$mypsa{$myacc}) < $mymaxdist && abs($myrsa{$myacc}-$mypsa{$myacc}) < $mymaxdist)) {
        $myt{$myacc} = ($myf{$myacc}+$myp{$myacc}+$myr{$myacc})/3;
        # $myt{$myacc} = $myf{$myacc};
        # if ($myt{$myacc} < $myp{$myacc}) {
          # $myt{$myacc} = $myp{$myacc};
          # }
        # if ($myt{$myacc} < $myr{$myacc}) {
          # $myt{$myacc} = $myr{$myacc};
          # }
        }
      }
    }
  my $myout = $myfile;
  $myout =~ s/\.csv/_hits.csv/;
  open (OUT, ">$myout") || die ("Could not open file $myout !!!\n");
  my $mymissfile = $myfile;
  $mymissfile =~ s/\.csv/_miss.txt/;
  open (MISS, ">$mymissfile") || die ("Could not open file $mymissfile !!!\n");
  my $myhits = 0;
  my $mymiss = 0;
  my $mymiss3 = 0;
  my $mymiss32 = 0;
  my $myfmiss = 0;
  my $myfmiss3 = 0;
  my $myfmiss32 = 0;
  my $myrmiss = 0;
  my $myrmiss3 = 0;
  my $myrmiss32 = 0;
  my $mypmiss = 0;
  my $mypmiss3 = 0;
  my $mypmiss32 = 0;
  # print OUT "Accession,%homology fwd,%homology rev,%homology prb,Details\n";
  print OUT "Accession,%homology fwd,%homology rev,%homology prb,FWD qfrom,FWD qseq,FWD qto,FWD sfrom,FWD sseq,FWD sto,REV qfrom,REV qseq,REV qto,REV sfrom,REV sseq,REV sto,PRB qfrom,PRB qseq,PRB qto,PRB sfrom,PRB sseq,PRB sto\n";
  # foreach my $myacc (reverse sort {$myt{$a} <=> $myt{$b} || $myepi{$a} cmp $myepi{$b}} keys %myt) {
  foreach my $myacc (reverse sort {$myt{$a} <=> $myt{$b} || $a cmp $b} keys %myt) {
    # printf "$myacc\t%.2f\t%.2f\t%.2f\t%.2f\n",$myf{$myacc},$myr{$myacc},$myp{$myacc},$myt{$myacc};
    # printf OUT "$myacc,%.2f,%.2f,%.2f,%s,%s,%s\n",$myf{$myacc},$myr{$myacc},$myp{$myacc},chomp($myfs{$myacc}),chomp($myrs{$myacc}),chomp($myps{$myacc});
    # printf "$myacc,%.2f,%.2f,%.2f,%s,%s,%s\n",$myf{$myacc},$myr{$myacc},$myp{$myacc},$myfs{$myacc},$myrs{$myacc},$myps{$myacc};
    # printf OUT "$myacc,%.2f,%.2f,%.2f,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",$myf{$myacc},$myr{$myacc},$myp{$myacc},$myfqa{$myacc},$myfseqq{$myacc},$myfqb{$myacc},$myfsa{$myacc},$myfseqs{$myacc},$myfsb{$myacc},$myfm{$myacc},$myfm3{$myacc},$myrm{$myacc},$myrm3{$myacc},$mypm{$myacc},$mypm3{$myacc};
    if ($myfm{$myacc} > 0) {
      # printf MISS "$myacc,%.2f,%.2f,%.2f,%s,%s\n",$myf{$myacc},$myr{$myacc},$myp{$myacc},$myfm{$myacc},$myfm3{$myacc};
      printf MISS "$myacc\t%.2f%%\t%d\t%d\n",$myf{$myacc},$myfm{$myacc},$myfm3{$myacc};
      # printf MISS "fwd %6d %s %6d\nhit %6d %s %6d\n",$myfqa{$myacc},$myfseqq{$myacc},$myfqb{$myacc},$myfsa{$myacc},$myfseqs{$myacc},$myfsb{$myacc};
      printf MISS "fwd %6d %s %6d\n           %s\nhit %6d %s %6d\n",1,$myprims{'fwd'},length($myprims{'fwd'}),$myfms{$myacc},$myfha{$myacc},$myfhs{$myacc},$myfhb{$myacc};
      }
    if ($myrm{$myacc} > 0) {
      # printf MISS "$myacc,%.2f,%.2f,%.2f,%s,%s\n",$myr{$myacc},$myr{$myacc},$myp{$myacc},$myrm{$myacc},$myrm3{$myacc};
      printf MISS "$myacc\t%.2f%%\t%d\t%d\n",$myr{$myacc},$myrm{$myacc},$myrm3{$myacc};
      # printf MISS "rev %6d %s %6d\nhit %6d %s %6d\n",$myrqa{$myacc},$myrseqq{$myacc},$myrqb{$myacc},$myrsa{$myacc},$myrseqs{$myacc},$myrsb{$myacc};
      # printf MISS "rev %6d %s %6d\n           %s\nhit %6d %s %6d\n",$myrqa{$myacc},$myrseqq{$myacc},$myrqb{$myacc},$myrms{$myacc},$myrsa{$myacc},$myrseqs{$myacc},$myrsb{$myacc};
      printf MISS "rev %6d %s %6d\n           %s\nhit %6d %s %6d\n",1,$myprims{'rev'},length($myprims{'rev'}),$myrms{$myacc},$myrha{$myacc},$myrhs{$myacc},$myrhb{$myacc};
      }
    if ($mypm{$myacc} > 0) {
      # printf MISS "$myacc,%.2f,%.2f,%.2f,%s,%s\n",$myp{$myacc},$myr{$myacc},$myp{$myacc},$mypm{$myacc},$mypm3{$myacc};
      printf MISS "$myacc\t%.2f%%\t%d\t%d\n",$myp{$myacc},$mypm{$myacc},$mypm3{$myacc};
      # printf MISS "prb %6d %s %6d\nhit %6d %s %6d\n",$mypqa{$myacc},$mypseqq{$myacc},$mypqb{$myacc},$mypsa{$myacc},$mypseqs{$myacc},$mypsb{$myacc};
      # printf MISS "prb %6d %s %6d\n           %s\nhit %6d %s %6d\n",$mypqa{$myacc},$mypseqq{$myacc},$mypqb{$myacc},$mypms{$myacc},$mypsa{$myacc},$mypseqs{$myacc},$mypsb{$myacc};
      printf MISS "prb %6d %s %6d\n           %s\nhit %6d %s %6d\n",1,$myprims{'prb'},length($myprims{'prb'}),$mypms{$myacc},$mypha{$myacc},$myphs{$myacc},$myphb{$myacc};
      }
    if ($myf{$myacc} == 100 && $myr{$myacc} == 100 && $myp{$myacc} == 100) {
      printf OUT "$myacc,%.2f,%.2f,%.2f,%d,%s,%d,%d,%s,%d,%d,%s,%d,%d,%s,%d,%d,%s,%d,%d,%s,%d\n",$myf{$myacc},$myr{$myacc},$myp{$myacc},$myfqa{$myacc},$myfseqq{$myacc},$myfqb{$myacc},$myfsa{$myacc},$myfseqs{$myacc},$myfsb{$myacc},$myrqa{$myacc},$myrseqq{$myacc},$myrqb{$myacc},$myrsa{$myacc},$myrseqs{$myacc},$myrsb{$myacc},$mypqa{$myacc},$mypseqq{$myacc},$mypqb{$myacc},$mypsa{$myacc},$mypseqs{$myacc},$mypsb{$myacc};
      $myhits++;
      }
    if ($myfm{$myacc} > 0 || $myrm{$myacc} > 0 || $mypm{$myacc} > 0) {
      $mymiss++;
      }
    if ($myfm3{$myacc} > 0 || $myrm3{$myacc} > 0 || $mypm3{$myacc} > 0) {
      $mymiss3++;
      }
    if ($myfm3{$myacc} > 1 || $myrm3{$myacc} > 1 || $mypm3{$myacc} > 1) {
      $mymiss32++;
      }
    if ($myfm{$myacc} > 0) {
      $myfmiss++;
      }
    if ($myfm3{$myacc} > 0) {
      $myfmiss3++;
      }
    if ($myfm3{$myacc} > 1) {
      $myfmiss32++;
      }
    if ($myrm{$myacc} > 0) {
      $myrmiss++;
      }
    if ($myrm3{$myacc} > 0) {
      $myrmiss3++;
      }
    if ($myrm3{$myacc} > 1) {
      $myrmiss32++;
      }
    if ($mypm{$myacc} > 0) {
      $mypmiss++;
      }
    if ($mypm3{$myacc} > 0) {
      $mypmiss3++;
      }
    if ($mypm3{$myacc} > 1) {
      $mypmiss32++;
      }
    }
  my $totmiss = 0;
  my $totmiss3 = 0;
  my $totmiss32 = 0;
  if ($myhits > 0) {
    $totmiss = 100*$mymiss/($myhits+$mymiss);
    $totmiss3 = 100*$mymiss3/($myhits+$mymiss);
    $totmiss32 = 100*$mymiss32/($myhits+$mymiss);
    printf MISS "\n--> %d of %d covered (%.2f%%)\n", $myhits, ($myhits+$mymiss), 100*$myhits/($myhits+$mymiss);
    printf MISS "--> %d of %d missed (%.2f%%) with at least 1 mismatch (%d fwd, %d rev, %d prb)\n", $mymiss, ($myhits+$mymiss), 100*$mymiss/($myhits+$mymiss),$myfmiss,$myrmiss,$mypmiss;
    printf MISS "--> %d of %d missed (%.2f%%) with at least 1 mismatch in 3' region (%d fwd, %d rev, %d prb)\n", $mymiss3, ($myhits+$mymiss), 100*$mymiss3/($myhits+$mymiss),$myfmiss3,$myrmiss3,$mypmiss3;
    printf MISS "--> %d of %d missed (%.2f%%) with at least 2 mismatches in 3' region (%d fwd, %d rev, %d prb)\n", $mymiss32, ($myhits+$mymiss), 100*$mymiss32/($myhits+$mymiss),$myfmiss32,$myrmiss32,$mypmiss32;
  # printf "\n--> %d of %d covered (%.2f%%)\n", $myhits, ($myhits+$mymiss), 100*$myhits/($myhits+$mymiss);
  # printf "--> %d of %d missed (%.2f%%) with at least 1 mismatch (%d fwd, %d rev, %d prb)\n", $mymiss, ($myhits+$mymiss), 100*$mymiss/($myhits+$mymiss),$myfmiss,$myrmiss,$mypmiss;
  # printf "--> %d of %d missed (%.2f%%) with at least 1 mismatch in 3' region (%d fwd, %d rev, %d prb)\n", $mymiss3, ($myhits+$mymiss), 100*$mymiss3/($myhits+$mymiss),$myfmiss3,$myrmiss3,$mypmiss3;
  # printf "--> %d of %d missed (%.2f%%) with at least 2 mismatches in 3' region (%d fwd, %d rev, %d prb)\n", $mymiss32, ($myhits+$mymiss), 100*$mymiss32/($myhits+$mymiss),$myfmiss32,$myrmiss32,close (MISS);
    }
  else {
    printf MISS "\n--> %d of %d covered (0.00%%)\n", $myhits, ($myhits+$mymiss);
    }
  close (OUT);
  close (FILE);
  # return((100*$mymiss/($myhits+$mymiss)),(100*$mymiss3/($myhits+$mymiss)),(100*$mymiss32/($myhits+$mymiss),($myhits+$mymiss)));
  return($totmiss,$totmiss3,$totmiss32,($myhits+$mymiss));
  }

sub mismatchStringsIDnuc {
  my ($s1,$s2) = @_;
  my $aarex = "[ACGTUacgtu]";
  my $mismatch = 0;
  my $len1 = 0;
  my $matchstring = "";
  if (length($s1) != length($s2)) {
    die "ERROR: matchStrings() strings have different length!\n  -> s1 $s1\n  -> s2 $s2\n\n";
    }
  for (my $mi=0; $mi<length($s1); $mi++) {
    if (substr($s1,$mi,1) =~ /$aarex/ && substr($s2,$mi,1) =~ /$aarex/) {
      $len1++;
      if (substr($s1,$mi,1) ne substr($s2,$mi,1)) {
        $mismatch++;
        $matchstring = $matchstring . "X";
        }
      else {
        $matchstring = $matchstring . "|";
        }
      }
    else {
      $matchstring = $matchstring . "0";
      }
    }
  # my $sim = 100*$mismatch/$len1;
  return($mismatch,$matchstring);
  }

sub mismatchStringsIDnuc3prime {
  my ($s1,$s2) = @_;
  my $aarex = "[ACGTUacgtu]";
  my $mismatch = 0;
  my $len1 = 0;
  if (length($s1) != length($s2)) {
    die "ERROR: matchStrings() strings have different length!\n  -> s1 $s1\n  -> s2 $s2\n\n";
    }
  for (my $mi=length($s1)-6; $mi<length($s1); $mi++) {
    if (substr($s1,$mi,1) =~ /$aarex/ && substr($s2,$mi,1) =~ /$aarex/) {
      $len1++;
      if (substr($s1,$mi,1) ne substr($s2,$mi,1)) {
        $mismatch++;
        }
      }
    }
  # my $sim = 100*$mismatch/$len1;
  return($mismatch);
  }
