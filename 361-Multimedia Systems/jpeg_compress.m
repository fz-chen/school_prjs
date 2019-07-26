function [DecodeImage] = compress(image)
%COMPRESS Summary of this function goes here
%   Detailed explanation goes here

[row,column, dim]= size(image);

%removing the extra pixels outside of size 8
if (mod(row, 8)~=0)
    extraPixel = mod(row, 8);
    image(end-extraPixel+1:end, :,:) = [];
end
if (mod(column, 8)~=0)
    extraPixel = mod(column, 8);
    image(:,end-extraPixel+1:end,:) = [];
end
 
R = double(image(:,:,1));
G = double(image(:,:,2));
B = double(image(:,:,3));

%YUV Conversion
Y = (0.299*R) + (0.587*G) + (0.114 * B);
U = (-0.14713 * R) + (-0.28886 * G) + (0.436 * B);
V = (0.615 * R) + (-0.51499 * G) + (-0.10001 * B);

[row,column]= size(Y);
%Chrom Subsampling
for i=1:row
    for j=1:column
        if (mod(i,2)==1&&mod(j,2)==1)
            V(i,j)=V(i+1,j);
        elseif (mod(i,2)==1&&mod(j,2)==0)
            U(i,j)=U(i,j-1);
            V(i,j)=V(i+1,j-1);
        elseif (mod(i,2)==0&&mod(j,2)==1)
            U(i,j)=U(i-1,j);
        else 
            U(i,j)=U(i-1,j-1);
            V(i,j)=V(i,j-1);
        end
    end
end          


a=floor(row/8);
b=floor(column/8);
if (mod(row,8)~=0)
    a=a+1;
end
if(mod(column,8)~=0)
    b=b+1;
end
rc=a*8-row;
cc=b*8-column;
Y1=ones(a*8,b*8);
U1=Y1;
V1=Y1;
Y1(1:row,1:column)=Y(:,:);
U1(1:row,1:column)=U(:,:);
V1(1:row,1:column)=V(:,:);
YUV = uint8(cat(3,Y1,U1,V1));
s1=8*ones(a,1);
s2=8*ones(b,1);
Y2=mat2cell(Y1,s1,s2);
U2=mat2cell(U1,s1,s2);
V2=mat2cell(V1,s1,s2);
A=zeros(8,8);
for i=1:8
    for j=1:8
        if(i==1) 
            A(i,j)=sqrt(1/8)*cos((j-1+0.5)*pi*(i-1)/8);
        else
            A(i,j)=sqrt(1/4)*cos((j-1+0.5)*pi*(i-1)/8);
        end
    end
end
Y3=Y2;
U3=U2;
V3=V2;
for i = 1:a
    for j = 1: b
        Y3{i,j}=A*Y2{i,j}*A';
        U3{i,j}=A*U2{i,j}*A';
        V3{i,j}=A*V2{i,j}*A';
    end
end
%end of DCT
%figure;
%imshow(YUV);

quantMatrixY =   [8 5 5 8 12 20 25 30;
                 6 6 7 9 13 29 30 27;
                 7 6 8 12 20 28 34 28;
                 7 8 11 14 25 43 40 31; 
                 9 11 18 28 34 54 51 38;
                 12 17 27 32 40 52 56 46;
                 24 43 39 43 51 60 60 50;
                 36 46 47 49 56 50 51 49];

quantMatrixUV = [17 18 24 47 99 99 99 99;
                18 21 26 66 99 99 99 99;
                24 26 56 99 99 99 99 99;
                47 66 99 99 99 99 99 99;
                99 99 99 99 99 99 99 99;
                99 99 99 99 99 99 99 99;
                99 99 99 99 99 99 99 99;
                99 99 99 99 99 99 99 99];             
        
for i = 1:a
    for j = 1: b
        Y3{i,j}=round(Y3{i,j}./quantMatrixY);
        U3{i,j}=round(U3{i,j}./quantMatrixUV);
        V3{i,j}=round(V3{i,j}./quantMatrixUV);
    end
end

QuantizedMatrix = cat(3,Y3,U3,V3);

save( 'tempJPEG', 'QuantizedMatrix');
QuantizedMatrix = load('tempJPEG');

%Decoder
for i = 1:a
    for j = 1: b
        DecodeY{i,j}=Y3{i,j}.*quantMatrixY;
        DecodeU{i,j}=U3{i,j}.*quantMatrixUV;
        DecodeV{i,j}=V3{i,j}.*quantMatrixUV;
    end
end

for i = 1:a
    for j = 1: b
        DecodeY{i,j}=A'*DecodeY{i,j}*A;
        DecodeU{i,j}=A'*DecodeU{i,j}*A;
        DecodeV{i,j}=A'*DecodeV{i,j}*A;
    end
end

DecodeYMat = cell2mat(DecodeY);
DecodeUMat = cell2mat(DecodeU);
DecodeVMat = cell2mat(DecodeV);
    
DecodeR = 1*DecodeYMat + 0 +  1.13983*DecodeVMat;
DecodeG = 1*DecodeYMat + (-0.39465)*DecodeUMat - 0.58060*DecodeVMat;
DecodeB = 1*DecodeYMat + 2.03211*DecodeUMat;

DecodeImage = uint8(cat(3,DecodeR,DecodeG,DecodeB));


end

