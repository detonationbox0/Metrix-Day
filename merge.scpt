FasdUAS 1.101.10   ��   ��    l      ����  i         I     �� ��
�� .aevtoappnull  �   � ****  o      ���� 0 argv  ��    Q     �  	 
  k    �       l   ��������  ��  ��        r        n        1   
 ��
�� 
psxp  l   
 ����  I   
��  
�� .earsffdralis        afdr  m    ��
�� afdmcusr  �� ��
�� 
rtyp  m    ��
�� 
ctxt��  ��  ��    o      ���� 0 userpath userPath      l   ��������  ��  ��        r        m       �    ~ /  n        !   1    ��
�� 
txdl ! 1    ��
�� 
ascr   " # " l   ��������  ��  ��   #  $ % $ r     & ' & n     ( ) ( 4    �� *
�� 
cobj * m    ����  ) o    ���� 0 argv   ' o      ���� 0 fileone fileOne %  + , + r    $ - . - b    " / 0 / o    ���� 0 userpath userPath 0 n    ! 1 2 1 4   !�� 3
�� 
citm 3 m     ����  2 o    ���� 0 fileone fileOne . o      ���� 0 
newfileone 
newFileOne ,  4 5 4 r   % + 6 7 6 n   % ) 8 9 8 4   & )�� :
�� 
cobj : m   ' (����  9 o   % &���� 0 argv   7 o      ���� 0 filetwo fileTwo 5  ; < ; r   , 4 = > = b   , 2 ? @ ? o   , -���� 0 userpath userPath @ n   - 1 A B A 4  . 1�� C
�� 
citm C m   / 0����  B o   - .���� 0 filetwo fileTwo > o      ���� 0 
newfiletwo 
newFileTwo <  D E D r   5 ; F G F n   5 9 H I H 4   6 9�� J
�� 
cobj J m   7 8����  I o   5 6���� 0 argv   G o      ���� 0 
mergedfile 
mergedFile E  K L K r   < F M N M n   < B O P O 4   = B�� Q
�� 
cobj Q m   > A����  P o   < =���� 0 argv   N o      ���� 0 pagenumbers pageNumbers L  R S R l  G G�� T U��   T % --set dirName to item 5 of argv    U � V V > - - s e t   d i r N a m e   t o   i t e m   5   o f   a r g v S  W X W l  G G��������  ��  ��   X  Y Z Y l  G G�� [ \��   [  display dialog dirName    \ � ] ] , d i s p l a y   d i a l o g   d i r N a m e Z  ^ _ ^ l  G G��������  ��  ��   _  ` a ` l  G G�� b c��   b D >set newMergedFile to userPath & second text item of mergedFile    c � d d | s e t   n e w M e r g e d F i l e   t o   u s e r P a t h   &   s e c o n d   t e x t   i t e m   o f   m e r g e d F i l e a  e f e l  G G�� g h��   g  display dialog mergedFile    h � i i 2 d i s p l a y   d i a l o g   m e r g e d F i l e f  j k j l  G G�� l m��   l � �"/System/Library/Automator/Combine PDF Pages.action/Contents/Resources/join.py" -o PATH/TO/YOUR/MERGED/FILE.pdf /PATH/TO/ORIGINAL/1.pdf /PATH/TO/ANOTHER/2.pdf /PATH/TO/A/WHOLE/DIR/*.pdf    m � n nr " / S y s t e m / L i b r a r y / A u t o m a t o r / C o m b i n e   P D F   P a g e s . a c t i o n / C o n t e n t s / R e s o u r c e s / j o i n . p y "   - o   P A T H / T O / Y O U R / M E R G E D / F I L E . p d f   / P A T H / T O / O R I G I N A L / 1 . p d f   / P A T H / T O / A N O T H E R / 2 . p d f   / P A T H / T O / A / W H O L E / D I R / * . p d f k  o p o l  G G�� q r��   q � �display dialog "'/System/Library/Automator/Combine PDF Pages.action/Contents/Resources/join.py' -o " & quoted form of mergedFile & " " & quoted form of newFileOne & " " & quoted form of newFileTwo    r � s s� d i s p l a y   d i a l o g   " ' / S y s t e m / L i b r a r y / A u t o m a t o r / C o m b i n e   P D F   P a g e s . a c t i o n / C o n t e n t s / R e s o u r c e s / j o i n . p y '   - o   "   &   q u o t e d   f o r m   o f   m e r g e d F i l e   &   "   "   &   q u o t e d   f o r m   o f   n e w F i l e O n e   &   "   "   &   q u o t e d   f o r m   o f   n e w F i l e T w o p  t�� t Q   G � u v w u I  J k�� x��
�� .sysoexecTEXT���     TEXT x b   J g y z y b   J a { | { b   J ] } ~ } b   J W  �  b   J S � � � m   J M � � � � � � ' / S y s t e m / L i b r a r y / A u t o m a t o r / C o m b i n e   P D F   P a g e s . a c t i o n / C o n t e n t s / R e s o u r c e s / j o i n . p y '   - o   � n   M R � � � 1   N R��
�� 
strq � o   M N���� 0 
mergedfile 
mergedFile � m   S V � � � � �    ~ n   W \ � � � 1   X \��
�� 
strq � o   W X���� 0 
newfileone 
newFileOne | m   ] ` � � � � �    z n   a f � � � 1   b f��
�� 
strq � o   a b���� 0 
newfiletwo 
newFileTwo��   v R      ������
�� .ascrerr ****      � ****��  ��   w Q   s � � � � � I  v ��� ���
�� .sysoexecTEXT���     TEXT � b   v � � � � b   v � � � � b   v � � � � b   v � � � � b   v � � � � b   v } � � � m   v y � � � � � 2 ' / u s r / l o c a l / b i n / p d f u n i t e ' � m   y | � � � � �    � n   } � � � � 1   ~ ���
�� 
strq � o   } ~���� 0 
newfileone 
newFileOne � m   � � � � � � �    � n   � � � � � 1   � ���
�� 
strq � o   � ����� 0 
newfiletwo 
newFileTwo � m   � � � � � � �    � n   � � � � � 1   � ���
�� 
strq � o   � ����� 0 
mergedfile 
mergedFile��   � R      ������
�� .ascrerr ****      � ****��  ��   � I  � ��� ���
�� .sysodlogaskr        TEXT � m   � � � � � � � � Y o u   s e e m   t o   b e   m i s s i n g   b o t h   P y t h o n   2   a n d   P o p p l e r !   P l e a s e   g e t   i n   t o u c h   w i t h   T o d d .��  ��   	 R      �� ���
�� .ascrerr ****      � **** � o      ���� 0 theerror theError��   
 I  � ��� ���
�� .sysodlogaskr        TEXT � o   � ����� 0 theerror theError��  ��  ��       �� � ���   � ��
�� .aevtoappnull  �   � **** � �� ���� � ���
�� .aevtoappnull  �   � ****�� 0 argv  ��   � ������ 0 argv  �� 0 theerror theError �  ������������ ���������������������� ��� � ������� � � � � �����
�� afdmcusr
�� 
rtyp
�� 
ctxt
�� .earsffdralis        afdr
�� 
psxp�� 0 userpath userPath
�� 
ascr
�� 
txdl
�� 
cobj�� 0 fileone fileOne
�� 
citm�� 0 
newfileone 
newFileOne�� 0 filetwo fileTwo�� 0 
newfiletwo 
newFileTwo�� 0 
mergedfile 
mergedFile�� �� 0 pagenumbers pageNumbers
�� 
strq
�� .sysoexecTEXT���     TEXT��  ��  
�� .sysodlogaskr        TEXT�� 0 theerror theError�� � ����l �,E�O���,FO��k/E�O���l/%E�O��l/E�O���l/%E�O��m/E�O��a /E` O &a �a ,%a %�a ,%a %�a ,%j W >X   *a a %�a ,%a %�a ,%a %�a ,%j W X  a j W X  �j  ascr  ��ޭ