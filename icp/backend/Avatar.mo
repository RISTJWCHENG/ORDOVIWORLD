import Array "mo:base/Array";
import Char "mo:base/Char";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
module {
  public func valid(value : Text) : Bool {
    // Keep existing short avatar values readable during the transition.
    if(value.size() <= 40 and not Text.startsWith(value,#text "data:")) return true;
    if(value.size() > 21871) return false;
    let encoded = switch(Text.stripStart(value,#text "data:image/jpeg;base64,")){case null return false;case (?text) text};
    if(encoded.size() < 8 or encoded.size() % 4 != 0) return false;
    let bytes=Array.init<Nat>(encoded.size()*3/4,0);
    var count=0;var accumulator=0;var bits=0;var padding=0;
    for(c in encoded.chars()){
      if(c=='='){padding+=1;if(padding > 2)return false}
      else {
        if(padding > 0)return false;
        let code=Nat32.toNat(Char.toNat32(c));
        let digit=if(code >= 65 and code <= 90)code-65 else if(code >= 97 and code <= 122)code-71 else if(code >= 48 and code <= 57)code+4 else if(c=='+')62 else if(c=='/')63 else return false;
        accumulator:=accumulator*64+digit;bits+=6;
        if(bits >= 8){bits-=8;let divisor=Nat.pow(2,bits);bytes[count]:=accumulator/divisor;count+=1;accumulator:=accumulator%divisor;};
      }
    };
    if(accumulator!=0 or (padding==0 and bits!=0) or (padding==1 and bits!=2) or (padding==2 and bits!=4))return false;
    if(count < 12 or count > 16384 or bytes[0]!=255 or bytes[1]!=216 or bytes[count-2]!=255 or bytes[count-1]!=217)return false;
    var position=2;var dimensions=false;
    while(position+3 < count){
      if(bytes[position]!=255)return false;
      if(bytes[position+1]==255){position+=1}
      else {
        let marker=bytes[position+1];
        if(marker==218)return dimensions;
        let length=bytes[position+2]*256+bytes[position+3];
        if(length < 2 or position+2+length > count)return false;
        if(marker==192 or marker==194){
          if(length < 8 or bytes[position+4]!=8)return false;
          let height=bytes[position+5]*256+bytes[position+6];let width=bytes[position+7]*256+bytes[position+8];
          if(width!=96 or height!=96)return false;dimensions:=true;
        };
        position+=2+length;
      }
    };false
  }
}
